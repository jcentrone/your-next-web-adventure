import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mic, Volume2, VolumeX } from "lucide-react";
import { sendMessage, type ChatMessage } from "@/integrations/chatbot";

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [followUp, setFollowUp] = React.useState<string[]>([]);
  const [listening, setListening] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(false);
  const [muted, setMuted] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("chatMuted") === "true";
  });

  const recognitionRef = React.useRef<any>(null);

  const sendTextRef = React.useRef<(text: string) => void>();

  const sendText = React.useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const userMessage: ChatMessage = { role: "user", content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setFollowUp([]);
      setLoading(true);

      try {
        const { stream, tool } = await sendMessage(newMessages);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let assistant = "";
        setMessages((msgs) => [...msgs, { role: "assistant", content: "" }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            assistant += decoder.decode(value, { stream: true });
            setMessages((msgs) => {
              const updated = [...msgs];
              updated[updated.length - 1] = { role: "assistant", content: assistant };
              return updated;
            });
          }
        }

        const info = await tool;
        if (info.recordId && info.recordType) {
          const base =
            info.recordType === "account"
              ? "/accounts"
              : info.recordType === "report"
              ? "/reports"
              : `/${info.recordType}s`;
          setMessages((msgs) => {
            const updated = [...msgs];
            updated[updated.length - 1] = {
              role: "assistant",
              content: `✅ ${info.recordType.charAt(0).toUpperCase() + info.recordType.slice(1)} created:`,
              link: `${base}/${info.recordId}`,
            };
            return updated;
          });
        } else if (info.missingFields?.length) {
          setFollowUp(info.missingFields);
          setMessages((msgs) => {
            const updated = [...msgs];
            updated[updated.length - 1] = {
              role: "assistant",
              content: `Please provide the following fields: ${info.missingFields.join(", ")}`,
            };
            return updated;
          });
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content:
              "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  sendTextRef.current = sendText;

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    localStorage.setItem("chatMuted", muted ? "true" : "false");
    if (muted) {
      window.speechSynthesis.cancel();
    }
  }, [muted]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (loading) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || muted) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(last.content));
  }, [messages, loading, muted]);

  React.useEffect(() => {
    if (!open && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendText(input);
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    setSpeechSupported(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      setInput(final || interim);
      if (final) {
        recognition.stop();
        setListening(false);
        sendTextRef.current?.(final);
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      let message = "Sorry, I couldn't understand that. Please try again.";
      if (event.error === "not-allowed") {
        message = "Microphone access was denied.";
      } else if (event.error === "no-speech") {
        message = "No speech was detected. Please try again.";
      }
      setMessages((msgs) => [...msgs, { role: "assistant", content: message }]);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="fixed bottom-4 right-4 rounded-full shadow-lg" aria-label="Open chat">
          <MessageCircle size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col">
        <div className="mb-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
        <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p>Hi! I'm here to help you with HomeReportPro.</p>
              <p>Ask me about creating reports, managing appointments, or any other questions!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span
                className={`inline-block rounded-md px-2 py-1 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                {msg.content}
                {msg.link && (
                  <a href={msg.link} className="ml-1 underline">
                    View
                  </a>
                )}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-left text-sm">
              <span className="inline-block rounded-md bg-secondary px-2 py-1">
                <span className="animate-pulse">Typing...</span>
              </span>
            </div>
          )}
        </div>
        {followUp.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
          {followUp.map((field) => (
            <Button
              key={field}
              variant="secondary"
              size="sm"
              onClick={() => setInput((prev) => `${prev}${prev ? " " : ""}${field}: `)}
              disabled={loading || listening}
            >
              {field}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {speechSupported && (
          <Button
            type="button"
            variant="secondary"
            onClick={toggleListening}
            className={listening ? "animate-pulse text-red-500" : ""}
            aria-label={listening ? "Stop recording" : "Start recording"}
            disabled={loading}
          >
            <Mic />
          </Button>
        )}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          aria-label="Message"
          disabled={loading || listening}
        />
        <Button type="submit" disabled={loading || listening}>
          Send
        </Button>
      </form>
      <Button asChild variant="link" className="mt-2 self-end">
        <a href="/support">Contact Support</a>
      </Button>
    </DialogContent>
  </Dialog>
  );
}

export default ChatWidget;
