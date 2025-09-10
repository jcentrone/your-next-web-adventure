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
const CONVERSATION_KEY = "chat_conversation_id";
let conversationId: string | null =
  typeof localStorage !== "undefined"
    ? localStorage.getItem(CONVERSATION_KEY)
    : null;

export function setConversationId(id: string | null) {
  conversationId = id;
  if (typeof localStorage !== "undefined") {
    if (id) {
      localStorage.setItem(CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(CONVERSATION_KEY);
    }
  }
}

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
      if (cid) setConversationId(cid);

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

export async function listConversations() {
  const { data, error } = await supabase
    .from("support_conversations")
    .select("id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchMessages(convoId: string) {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("conversation_id", convoId)
    .order("created_at");
  if (error) throw error;
  return data;
}

export default { sendMessage, listConversations, fetchMessages, setConversationId };
