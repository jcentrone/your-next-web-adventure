import { QueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

export type ChatMessage = {
  role: string;
  content: string;
};

const queryClient = new QueryClient();

export async function sendMessage(
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  return queryClient.fetchQuery<ReadableStream<Uint8Array>>({
    queryKey: ["chatbot", messages],
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
        body: JSON.stringify({ messages }),
      });
      if (!res.ok || !res.body) {
        throw new Error("Chatbot request failed");
      }
      return res.body;
    },
    retry: 3,
  });
}

export default { sendMessage };
