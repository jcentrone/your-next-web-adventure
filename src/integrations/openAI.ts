import { supabase } from "@/integrations/supabase/client";

const TABLE = "ai_tokens";

export async function isConnected(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("api_key")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("OpenAI: isConnected error", error);
    return false;
  }
  return !!data?.api_key;
}

export async function connect(userId: string, apiKey: string) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, api_key: apiKey }, { onConflict: "user_id" });
  if (error) {
    console.error("OpenAI: connect error", error);
    throw error;
  }
}

export async function disconnect(userId: string) {
  const { error } = await supabase.from(TABLE).delete().eq("user_id", userId);
  if (error) {
    console.error("OpenAI: disconnect error", error);
    throw error;
  }
}

export default { isConnected, connect, disconnect };
