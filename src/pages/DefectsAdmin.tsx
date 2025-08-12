import React from "react";
import Seo from "@/components/Seo";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { SOP_SECTIONS } from "@/constants/sop";
import { supabase } from "@/integrations/supabase/client";

// DB-backed Defect Library Admin
const DefectsAdmin: React.FC = () => {
  const [json, setJson] = React.useState("");
  const [fileName, setFileName] = React.useState("defects-library.json");
  const [defects, setDefects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Auth state (inline sign-in for admin page)
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [session, setSession] = React.useState<import("@supabase/supabase-js").Session | null>(null);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchDefects = React.useCallback(async () => {
    const { data, error } = await supabase.from("defects").select("*").order("section_key");
    if (error) {
      toast({ title: "Failed to load defects", description: error.message, variant: "destructive" });
      return;
    }
    setDefects(data || []);
  }, []);

  React.useEffect(() => {
    fetchDefects();
  }, [fetchDefects]);

  // Helpers to normalize incoming JSON
  const nameToKey = React.useMemo(() => {
    const m = new Map<string, string>();
    SOP_SECTIONS.forEach((s) => {
      m.set(s.name.toLowerCase(), s.key);
      m.set(s.key.toLowerCase(), s.key);
    });
    return m;
  }, []);

  const normalizeSection = (v: string) => {
    const key = nameToKey.get((v || "").trim().toLowerCase());
    if (!key) throw new Error(`Unknown section: ${v}`);
    return key;
  };

  const normalizeSeverity = (v: string) => {
    const t = (v || "").trim().toLowerCase();
    const map: Record<string, string> = {
      info: "Info",
      maintenance: "Maintenance",
      minor: "Minor",
      moderate: "Moderate",
      major: "Major",
      safety: "Safety",
    };
    const out = map[t];
    if (!out) throw new Error(`Unknown severity: ${v}`);
    return out;
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
    toast({ title: "Signed in", description: email });
    fetchDefects();
  };

  const handleSignUp = async () => {
    const redirectUrl = `${window.location.origin}/defects-admin`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) return toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
    toast({ title: "Check your email", description: "Confirm your address to complete sign-up." });
  };

  const importJson = async () => {
    try {
      if (!session) throw new Error("Please sign in to import into the database.");
      const data = JSON.parse(json);
      if (!Array.isArray(data)) throw new Error("JSON must be an array of defects");
      const rows = data.map((d: any) => ({
        section_key: normalizeSection(d.section),
        title: String(d.title || "").trim(),
        description: String(d.description || "").trim(),
        severity: normalizeSeverity(d.severity || ""),
        recommendation: d.recommendation ? String(d.recommendation) : null,
        media_guidance: d.media_guidance ? String(d.media_guidance) : null,
        tags: Array.isArray(d.tags) ? d.tags.map((t: any) => String(t)) : [],
        is_active: d.is_active === false ? false : true,
      }));
      if (!rows.length) throw new Error("No items to import");
      if (rows.some((r) => !r.title || !r.description)) {
        throw new Error("Each defect must include title and description");
      }
      setLoading(true);
      const { error } = await supabase
        .from("defects")
        .upsert(rows as any, { onConflict: "section_key,title" });
      setLoading(false);
      if (error) throw error;
      toast({ title: "Defect library imported", description: `${rows.length} items saved to database.` });
      setJson("");
      fetchDefects();
    } catch (e: any) {
      setLoading(false);
      toast({ title: "Import failed", description: e.message || "Invalid JSON", variant: "destructive" });
    }
  };

  const exportJson = async () => {
    const { data, error } = await supabase.from("defects").select("*");
    if (error) return toast({ title: "Export failed", description: error.message, variant: "destructive" });
    const blob = new Blob([JSON.stringify(data ?? [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Seo
        title="Defect Library Admin | Home Inspection"
        description="Import and manage the narrative defect library by section."
        canonical={window.location.origin + "/defects-admin"}
      />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-2">Defect Library Admin</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Paste your JSON array of defects (fields: section, title, description, severity, recommendation?, media_guidance?). Saved in database.
        </p>

        {!session && (
          <div className="rounded-lg border p-4 mb-6">
            <h2 className="font-medium mb-3">Sign in to manage the library</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleSignIn}>Sign in</Button>
                <Button variant="outline" onClick={handleSignUp}>Sign up</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Only authenticated users can insert/update defects due to security policies.</p>
          </div>
        )}

        <div className="rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} aria-label="File name" />
            <Button variant="outline" onClick={exportJson}>Export (DB)</Button>
          </div>
          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste defects JSON here..."
            className="min-h-40"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={importJson} disabled={loading || !session}>
              {loading ? "Importing..." : "Import JSON to DB"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Current Library Summary (DB)</h2>
          <p className="text-sm text-muted-foreground mb-3">Total items: {defects.length}</p>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {SOP_SECTIONS.map((s) => (
              <li key={s.key} className="flex items-center justify-between border rounded p-2">
                <span>{s.name}</span>
                <span className="text-muted-foreground">
                  {defects.filter((d) => d.section_key === s.key).length}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default DefectsAdmin;
