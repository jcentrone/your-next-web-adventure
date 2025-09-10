import { QueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

export type ChatMessage = {
  role: string;
  content: string;
  link?: string;
};

export type ToolCallInfo = {
  recordId?: string;
  recordType?: string;
  missingFields?: string[];
};

const queryClient = new QueryClient();
let conversationId: string | null = null;

function detectRecordType(record: any): string | undefined {
  if (record?.reportType) return "report";
  if (record?.first_name || record?.last_name) return "contact";
  if (record?.appointment_date || record?.appointmentDate) return "appointment";
  if (record?.due_date || record?.dueDate) return "task";
  if (record?.industry || record?.type) return "account";
  return undefined;
}

export async function sendMessage(
  messages: ChatMessage[],
): Promise<{ stream: ReadableStream<Uint8Array>; tool: Promise<ToolCallInfo> }> {
  return queryClient.fetchQuery<{ stream: ReadableStream<Uint8Array>; tool: Promise<ToolCallInfo> }>({
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

      const [stream, probe] = res.body.tee();
      const tool = (async () => {
        const reader = probe.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) full += decoder.decode(value, { stream: true });
        }
        full += decoder.decode();
        try {
          const data = JSON.parse(full);
          const recordId = data?.id ?? (Array.isArray(data) ? data[0]?.id : undefined);
          const recordType = detectRecordType(data);
          return recordId ? { recordId, recordType } : {};
        } catch {
          const prefix = "Missing required fields:";
          if (full.startsWith(prefix)) {
            const missingFields = full
              .slice(prefix.length)
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean);
            return { missingFields };
          }
          return {};
        }
      })();

      return { stream, tool };
    },
    retry: 3,
  });
}

export default { sendMessage };
