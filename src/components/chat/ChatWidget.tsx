import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sendMessage, type ChatMessage } from "@/integrations/chatbot";

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
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
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-4 right-4 rounded-full shadow-lg" aria-label="Open chat">
          Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col">
        <div className="mb-4 flex-1 space-y-2 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span className="inline-block rounded-md bg-secondary px-2 py-1">{msg.content}</span>
            </div>
          ))}
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
