import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, Volume2, VolumeX } from "lucide-react";
import { sendMessage, type ChatMessage } from "@/integrations/chatbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [followUp, setFollowUp] = React.useState<string[]>([]);
  const [listening, setListening] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(false);
  const [muted, setMuted] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("chatMuted") === "true";
  });

  const recognitionRef = React.useRef<any>(null);

  const sendTextRef = React.useRef<(text: string, file?: File | null) => void>();

  const sendText = React.useCallback(
    async (text: string, file?: File | null) => {
      if ((!text.trim() && !file) || loading) return;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      let encoded: string | undefined;
      if (file) {
        encoded = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }
      const userMessage: ChatMessage = {
        role: "user",
        content: text,
        ...(encoded ? { image: encoded } : {}),
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setImage(null);
      setPreview(null);
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
    await sendText(input, image);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
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
        <Button variant="secondary" size="lg" className="fixed bottom-4 right-4 rounded-xl shadow-lg [&>svg]:!w-8 [&>svg]:!h-8 p-4 z-50" aria-label="Open chat">
          <MessageSquare />
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed bottom-4 right-4 top-auto left-auto translate-x-0 translate-y-0 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] flex flex-col p-0 rounded-lg shadow-xl border z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Bob</h3>
              <p className="text-xs opacity-80">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium">Hi! I'm Bob, your AI assistant</p>
              <p className="text-sm mt-1">I'm here to help you with HomeReportPro.</p>
              <p className="text-sm">Ask me about creating reports, managing appointments, or any other questions!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-start gap-2 max-w-[80%]">
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-background border rounded-bl-sm shadow-sm"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{ p: ({ node, ...props }) => <p {...props} className="m-0" /> }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  {msg.image && (
                    <img src={msg.image} alt="uploaded" className="mt-2 rounded max-w-full" />
                  )}
                  {msg.link && (
                    <a href={msg.link} className="ml-1 underline hover:no-underline">
                      View →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="bg-background border rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Follow-up suggestions */}
        {followUp.length > 0 && (
          <div className="px-4 py-2 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {followUp.map((field) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput((prev) => `${prev}${prev ? " " : ""}${field}: `)}
                  disabled={loading || listening}
                  className="text-xs h-7 px-2"
                >
                  {field}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t bg-background">
          {preview && (
            <div className="mb-2">
              <img src={preview} alt="preview" className="max-h-32 rounded" />
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            {speechSupported && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleListening}
                className={`flex-shrink-0 ${listening ? "animate-pulse text-red-500 border-red-200" : ""}`}
                aria-label={listening ? "Stop recording" : "Start recording"}
                disabled={loading}
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              aria-label="Upload image"
              disabled={loading || listening}
              className="flex-shrink-0"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Type your message..."}
              aria-label="Message"
              disabled={loading || listening}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || listening || (!input.trim() && !image)}
              className="flex-shrink-0"
            >
              Send
            </Button>
          </form>
          
          <div className="mt-2 text-center">
            <Button asChild variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">
              <a href="/support">Need more help? Contact Support</a>
            </Button>
          </div>
        </div>
    </DialogContent>
  </Dialog>
  );
}

export default ChatWidget;
