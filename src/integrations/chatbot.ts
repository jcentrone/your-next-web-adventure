import { QueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

export type ChatMessage = {
  role: string;
  content: string;
};

const queryClient = new QueryClient();
let conversationId: string | null = null;

export async function sendMessage(
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  return queryClient.fetchQuery<ReadableStream<Uint8Array>>({
    queryKey: ["chatbot", messages, conversationId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages, conversation_id: conversationId }),
      });
      if (!res.ok || !res.body) {
        throw new Error("Chatbot request failed");
      }
      const cid = res.headers.get("x-conversation-id");
      if (cid) conversationId = cid;
      return res.body;
    },
    retry: 3,
  });
}

export default { sendMessage };
