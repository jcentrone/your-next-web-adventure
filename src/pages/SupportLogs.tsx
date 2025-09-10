import React from "react";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SupportLogs: React.FC = () => {
  const [session, setSession] = React.useState<import("@supabase/supabase-js").Session | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [convos, setConvos] = React.useState<any[]>([]);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchConvos = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("support_conversations")
      .select("id, created_at, escalated, support_messages (id, role, content, created_at)")
      .order("created_at", { ascending: false });
    if (!error) setConvos(data || []);
  }, []);

  React.useEffect(() => {
    if (session) fetchConvos();
  }, [session, fetchConvos]);

  const signIn = async () => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const toggleEscalated = async (id: string, value: boolean) => {
    await supabase.from("support_conversations").update({ escalated: value }).eq("id", id);
    fetchConvos();
  };

  return (
    <>
      <Seo
        title="Support Logs | Home Inspection"
        description="Review chatbot conversations"
        canonical={window.location.origin + "/support-logs"}
      />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Support Logs</h1>
        {!session && (
          <div className="rounded-lg border p-4 mb-6">
            <h2 className="font-medium mb-3">Sign in</h2>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={signIn}>Sign in</Button>
            </div>
          </div>
        )}
        {session && (
          <div className="space-y-4">
            {convos.map((c) => (
              <div key={c.id} className="rounded border p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                  <label className="text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={c.escalated}
                      onChange={(e) => toggleEscalated(c.id, e.target.checked)}
                    />
                    Escalated
                  </label>
                </div>
                <div className="space-y-2 text-sm">
                  {c.support_messages?.map((m: any) => (
                    <div key={m.id}>
                      <span className="font-medium">{m.role}: </span>
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SupportLogs;
