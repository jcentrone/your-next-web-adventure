
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SOP_SECTIONS, SectionKey } from "@/constants/sop";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PersonalDefectForm from "./PersonalDefectForm";
import { Badge } from "@/components/ui/badge";

export type LibrarySeverity = "Minor" | "Moderate" | "Major";

export type DefectTemplate = {
  id?: string;
  section: string; // e.g., "Roof"
  title: string;
  description: string;
  severity: LibrarySeverity;
  recommendation?: string;
  media_guidance?: string;
  source?: "global" | "mine";
};

function loadLibrary(): DefectTemplate[] {
  try {
    const raw = localStorage.getItem("defects:library");
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function sectionNameForKey(key: SectionKey): string {
  return SOP_SECTIONS.find((s) => s.key === key)?.name || "";
}

function toId(v: DefectTemplate) {
  return (
    v.id ||
    `${v.section}-${v.title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

function mapSeverity(sev: LibrarySeverity) {
  switch (sev) {
    case "Minor":
      return "Minor" as const;
    case "Moderate":
      return "Moderate" as const;
    case "Major":
      return "Major" as const;
  }
}

function mapDbSeverity(sev: string): LibrarySeverity {
  const s = (sev || "").toLowerCase();
  if (s === "major") return "Major";
  if (s === "moderate") return "Moderate";
  if (s === "minor") return "Minor";
  if (s === "safety") return "Major";
  if (s === "maintenance" || s === "info") return "Minor";
  return "Minor";
}

function extractPlaceholders(text: string) {
  const re = /\[([^\]]+)\]/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) set.add(m[1]);
  return Array.from(set);
}

function applyPlaceholders(text: string, values: Record<string, string>) {
  return text.replace(/\[([^\]]+)\]/g, (_, k) => values[k] ?? `[${k}]`);
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionKey: SectionKey;
  onInsert: (tpl: {
    title: string;
    narrative: string;
    severity: "Info" | "Minor" | "Moderate" | "Major";
    recommendation?: string;
    mediaGuidance?: string;
    defectId?: string | null;
  }) => void;
}

const DefectPicker: React.FC<Props> = ({ open, onOpenChange, sectionKey, onInsert }) => {
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<DefectTemplate | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [library, setLibrary] = React.useState<DefectTemplate[]>([]);
  const [myLibrary, setMyLibrary] = React.useState<DefectTemplate[]>([]);
  const [showCreate, setShowCreate] = React.useState(false);
  const { user } = useAuth();

  const sectionName = sectionNameForKey(sectionKey);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // Global defects
      const { data: gData, error: gErr } = await supabase
        .from("defects")
        .select("id,title,description,recommendation,media_guidance,severity,section_key,is_active")
        .eq("section_key", sectionKey as any)
        .eq("is_active", true)
        .order("title");
      if (gErr) {
        setLibrary([]);
      } else {
        const mapped: DefectTemplate[] = (gData ?? []).map((row: any) => ({
          id: row.id,
          section: sectionName,
          title: row.title,
          description: row.description,
          severity: mapDbSeverity(row.severity),
          recommendation: row.recommendation ?? undefined,
          media_guidance: row.media_guidance ?? undefined,
          source: "global",
        }));
        if (!cancelled) setLibrary(mapped);
      }

      // Personal defects (only if signed in)
      if (user) {
        const { data: pData, error: pErr } = await supabase
          .from("user_defects")
          .select("id,title,description,recommendation,media_guidance,severity,section_key,is_active")
          .eq("section_key", sectionKey as any)
          .eq("is_active", true)
          .order("title");
        if (pErr) {
          setMyLibrary([]);
        } else {
          const mappedMine: DefectTemplate[] = (pData ?? []).map((row: any) => ({
            id: row.id,
            section: sectionName,
            title: row.title,
            description: row.description,
            severity: mapDbSeverity(row.severity),
            recommendation: row.recommendation ?? undefined,
            media_guidance: row.media_guidance ?? undefined,
            source: "mine",
          }));
          if (!cancelled) setMyLibrary(mappedMine);
        }
      } else {
        setMyLibrary([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, sectionKey, sectionName, user]);

  const list = React.useMemo(() => {
    const pool = [...myLibrary, ...library].filter((d) => d.section === sectionName);
    if (!q) return pool;
    const qq = q.toLowerCase();
    return pool.filter(
      (d) =>
        d.title.toLowerCase().includes(qq) ||
        d.description.toLowerCase().includes(qq) ||
        (d.recommendation || "").toLowerCase().includes(qq)
    );
  }, [library, myLibrary, q, sectionName]);

  React.useEffect(() => {
    if (!selected) return;
    const phs = extractPlaceholders(selected.description);
    const next: Record<string, string> = {};
    phs.forEach((p) => (next[p] = values[p] ?? ""));
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.title]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add from Defect Library – {sectionName}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <Input
              placeholder="Search defects..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search defects"
            />
            <Button
              className="mt-2 w-full"
              variant="secondary"
              onClick={() => {
                onInsert({
                  title: "New observation",
                  narrative: "",
                  severity: "Info",
                  recommendation: "",
                  mediaGuidance: "",
                  defectId: null,
                });
                onOpenChange(false);
              }}
            >
              Insert blank observation
            </Button>

            <Button
              className="mt-2 w-full"
              onClick={() => {
                if (!user) {
                  window.location.href = `/auth?redirectTo=${encodeURIComponent(window.location.pathname)}`;
                  return;
                }
                setShowCreate((s) => !s);
              }}
            >
              {showCreate ? "Close personal defect form" : "New personal defect"}
            </Button>

            <div className="mt-3 max-h-80 overflow-auto rounded border divide-y">
              {list.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No defects found for this section.</div>
              )}
              {list.map((d) => (
                <button
                  key={toId(d)}
                  onClick={() => setSelected(d)}
                  className={`w-full text-left p-3 hover:bg-accent ${selected?.title === d.title ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{d.title}</div>
                    {d.source === "mine" && <Badge variant="secondary">My</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">Severity: {d.severity}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            {showCreate && user && (
              <div className="mb-4">
                <PersonalDefectForm
                  sectionKey={sectionKey}
                  onSaved={(defect) => {
                    const mapped: DefectTemplate = {
                      id: defect.id,
                      section: sectionName,
                      title: defect.title,
                      description: defect.description,
                      severity: defect.severity,
                      recommendation: defect.recommendation,
                      media_guidance: defect.media_guidance,
                      source: "mine",
                    };
                    setMyLibrary((prev) => [mapped, ...prev]);
                    setSelected(mapped);
                    setShowCreate(false);
                  }}
                  onCancel={() => setShowCreate(false)}
                />
              </div>
            )}

            {!selected ? (
              <p className="text-sm text-muted-foreground">Select a defect on the left to preview and insert.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Description</div>
                  <Textarea value={selected.description} readOnly className="min-h-24" />
                </div>
                {extractPlaceholders(selected.description).length > 0 && (
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      Fill Description Placeholders
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center"
                              aria-label="What are description placeholders?"
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Replace bracketed tokens like [location] before inserting the narrative.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {extractPlaceholders(selected.description).map((k) => (
                        <Input
                          key={k}
                          placeholder={k}
                          value={values[k] || ""}
                          onChange={(e) => setValues((p) => ({ ...p, [k]: e.target.value }))}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {selected.recommendation && (
                  <div>
                    <div className="text-sm font-medium mb-1">Recommendation</div>
                    <Textarea value={selected.recommendation} readOnly className="min-h-20" />
                  </div>
                )}
                {selected.media_guidance && (
                  <p className="text-xs text-muted-foreground">Media guidance: {selected.media_guidance}</p>
                )}
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      const narrative = applyPlaceholders(selected.description, values);
                      onInsert({
                        title: selected.title,
                        narrative,
                        severity: mapSeverity(selected.severity),
                        recommendation: selected.recommendation,
                        mediaGuidance: selected.media_guidance,
                        defectId: toId(selected),
                      });
                      onOpenChange(false);
                    }}
                  >
                    Insert into section
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DefectPicker;
