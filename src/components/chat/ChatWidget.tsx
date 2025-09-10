import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import { sendMessage, type ChatMessage } from "@/integrations/chatbot";

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    
    try {
      const stream = await sendMessage(newMessages);
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
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((msgs) => [...msgs, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="fixed bottom-4 right-4 rounded-full shadow-lg" aria-label="Open chat">
          <MessageCircle size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col">
        <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p>Hi! I'm here to help you with HomeReportPro.</p>
              <p>Ask me about creating reports, managing appointments, or any other questions!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block rounded-md px-2 py-1 ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}>
                {msg.content}
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
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message"
            aria-label="Message"
          />
          <Button type="submit" disabled={loading}>
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
