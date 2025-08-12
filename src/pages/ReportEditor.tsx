import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { loadReport as loadLocalReport, saveReport as saveLocalReport } from "@/hooks/useLocalDraft";
import { useAutosave } from "@/hooks/useAutosave";
import { SectionKey, SOP_SECTIONS } from "@/constants/sop";
import { Finding, Report, Media } from "@/lib/reportSchemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import DefectPicker from "@/components/reports/DefectPicker";
import { SOP_GUIDANCE } from "@/constants/sopGuidance";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport, dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { uploadFindingFiles, isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";

const SEVERITIES = ["Info", "Maintenance", "Minor", "Moderate", "Major", "Safety"] as const;

type Severity = typeof SEVERITIES[number];

const ReportEditor: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = React.useState<Report | null>(null);
  const [active, setActive] = React.useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      let r: Report | null = null;
      try {
        if (user) {
          r = await dbGetReport(id);
        } else {
          r = loadLocalReport(id);
        }
      } catch (e) {
        console.error(e);
      }
      if (!r) {
        nav("/reports");
        return;
      }
      // normalize: ensure finalize section and finalComments exist and all SOP sections are present
      const rr: Report = {
        ...r,
        finalComments: (r as any).finalComments ?? "",
        sections: [...r.sections],
      } as Report;
      const existingKeys = new Set(rr.sections.map((s) => s.key));
      SOP_SECTIONS.forEach((s) => {
        if (!existingKeys.has(s.key as SectionKey)) {
          rr.sections.push({ id: `${rr.id}-sec-${s.key}`, key: s.key as SectionKey, title: s.name, findings: [] } as any);
        }
      });
      setReport(rr);
      setActive(rr.sections[0]?.id ?? null);
    };
    load();
  }, [id, nav, user]);

  useAutosave({
    value: report,
    onSave: async (value) => {
      if (!value) return;
      // Always keep a local copy for offline resiliency
      saveLocalReport(value);
      // If authenticated, also sync to Supabase
      if (user) {
        try {
          await dbUpdateReport(value);
        } catch (e) {
          console.error(e);
        }
      }
    },
    delay: 1000,
  });

  // Compute activeSection safely; do not rely on rendering position
  const activeSection = React.useMemo(() => {
    if (!report) return undefined;
    return report.sections.find((s) => s.id === active) ?? report.sections[0];
  }, [report, active]);

  // Resolve signed URLs for media in the active section (only when authenticated).
  // This effect is always declared (hook order is stable) and guards internally.
  React.useEffect(() => {
    if (!report || !activeSection) return;
    if (!user) return; // only authenticated users can fetch signed URLs
    const medias = activeSection.findings.flatMap((f) => f.media).filter((m) => isSupabaseUrl(m.url));
    if (medias.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        medias.map(async (m) => {
          const signed = await getSignedUrlFromSupabaseUrl(m.url);
          return [m.id, signed] as const;
        })
      );
      if (!cancelled) {
        setMediaUrlMap((prev) => {
          const next = { ...prev };
          for (const [id, url] of entries) next[id] = url;
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, activeSection, report?.id]);

  if (!report) return null;

  const updateFinding = (fid: string, patch: Partial<Finding>) => {
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
      if (sIdx === -1) return prev;
      const fIdx = next.sections[sIdx].findings.findIndex((f) => f.id === fid);
      if (fIdx === -1) return prev;
      next.sections[sIdx].findings[fIdx] = { ...next.sections[sIdx].findings[fIdx], ...patch } as Finding;
      return { ...next };
    });
  };

  const addFinding = () => {
    const fid = crypto.randomUUID();
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
      next.sections[sIdx].findings.unshift({
        id: fid,
        title: "New observation",
        severity: "Info",
        narrative: "",
        recommendation: "",
        mediaGuidance: "",
        media: [],
        includeInSummary: false,
      } as Finding);
      return { ...next };
    });
  };

  const addFindingFromTemplate = (tpl: {
    title: string;
    narrative: string;
    severity: Severity;
    recommendation?: string;
    mediaGuidance?: string;
    defectId?: string | null;
  }) => {
    const fid = crypto.randomUUID();
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
      next.sections[sIdx].findings.unshift({
        id: fid,
        title: tpl.title,
        severity: tpl.severity,
        narrative: tpl.narrative,
        recommendation: tpl.recommendation || "",
        mediaGuidance: tpl.mediaGuidance || "",
        defectId: tpl.defectId ?? null,
        media: [],
        includeInSummary: false,
      } as Finding);
      return { ...next };
    });
  };
  const removeFinding = (fid: string) => {
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
      next.sections[sIdx].findings = next.sections[sIdx].findings.filter((f) => f.id !== fid);
      return { ...next };
    });
  };

  const moveFinding = (fid: string, dir: -1 | 1) => {
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
      const arr = next.sections[sIdx].findings;
      const idx = arr.findIndex((f) => f.id === fid);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= arr.length) return prev;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return { ...next };
    });
  };

  const setSection = (key: SectionKey) => {
    const s = report.sections.find((s) => s.key === key);
    if (s) setActive(s.id);
  };

  const finalize = () => {
    setReport((prev) => (prev ? { ...prev, status: "Final" } : prev));
    toast({ title: "Report finalized. Use Preview to print/PDF." });
  };

  return (
    <>
      <Seo
        title={`${report.title} | Report Editor`}
        description={`Editing report for ${report.clientName} at ${report.address}`}
        canonical={window.location.origin + `/reports/${report.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-3">Sections</h2>
            <nav className="space-y-1">
              {SOP_SECTIONS.map((s) => {
                const sec = report.sections.find((x) => x.key === s.key)!;
                const count = sec.findings.length;
                return (
                  <button
                    key={s.key}
                    className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 border ${active === sec.id ? "bg-accent" : "bg-background"}`}
                    onClick={() => setActive(sec.id)}
                    aria-current={active === sec.id}
                  >
                    <span className="truncate">{s.name}</span>
                    {count > 0 && (
                      <span
                        className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-[10px] shrink-0"
                        aria-label={`${count} observations`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="col-span-12 md:col-span-9">
          <header className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-xl font-semibold flex-1">{activeSection.title}</h1>
            <Button variant="outline" onClick={() => nav(`/reports/${report.id}/preview`)}>Preview</Button>
            <Button onClick={() => setPickerOpen(true)}>Add Observation</Button>
          </header>

          {activeSection.key !== "finalize" ? (
            <>
              <section className="mb-4 rounded-md border p-3">
                <details>
                  <summary className="text-sm font-medium">What to inspect (InterNACHI)</summary>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(SOP_GUIDANCE[activeSection.key] || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </details>
              </section>

              <div className="space-y-4">
                {activeSection.findings.length === 0 && (
                  <p className="text-sm text-muted-foreground">No observations yet.</p>
                )}
                {activeSection.findings.map((f) => (
                  <article key={f.id} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={f.title}
                        onChange={(e) => updateFinding(f.id, { title: e.target.value })}
                        aria-label="Finding title"
                      />
                      <select
                        className="border rounded-md h-10 px-2 text-sm"
                        value={f.severity}
                        onChange={(e) => updateFinding(f.id, { severity: e.target.value as Severity })}
                        aria-label="Severity"
                      >
                        {SEVERITIES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={f.includeInSummary}
                          onChange={(e) => updateFinding(f.id, { includeInSummary: e.target.checked })}
                        />
                        Summary
                      </label>
                    </div>
                    <div className="mt-3">
                      <Textarea
                        placeholder="Narrative"
                        value={f.narrative || ""}
                        onChange={(e) => updateFinding(f.id, { narrative: e.target.value })}
                      />
                    </div>
                    <div className="mt-3">
                      <Textarea
                        placeholder="Recommendation"
                        value={f.recommendation || ""}
                        onChange={(e) => updateFinding(f.id, { recommendation: e.target.value })}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;

                          if (user) {
                            // Upload to Supabase Storage, store supabase:// URLs in report data
                            try {
                              const uploaded = await uploadFindingFiles({
                                userId: user.id,
                                reportId: report.id,
                                findingId: f.id,
                                files,
                              });
                              updateFinding(f.id, { media: [...f.media, ...uploaded] });
                              toast({ title: "Media uploaded", description: `${uploaded.length} file(s) added.` });
                            } catch (err) {
                              console.error(err);
                              toast({ title: "Upload failed", description: "Could not upload media.", variant: "destructive" });
                            }
                          } else {
                            // Local-only (unauthenticated): use object URLs
                            const media: Media[] = files.map((file) => {
                              const mtype: Media["type"] =
                                file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image";
                              return {
                                id: crypto.randomUUID(),
                                type: mtype,
                                url: URL.createObjectURL(file),
                                caption: file.name,
                              };
                            });
                            updateFinding(f.id, { media: [...f.media, ...media] });
                          }

                          // clear input so the same file can be re-selected if needed
                          e.currentTarget.value = "";
                        }}
                      />
                    </div>
                    {f.mediaGuidance && (
                      <p className="text-xs text-muted-foreground mt-2">Media guidance: {f.mediaGuidance}</p>
                    )}
                    {f.media.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {f.media.map((m) => {
                          const resolvedUrl = mediaUrlMap[m.id] || m.url;
                          return (
                            <figure key={m.id} className="rounded border p-2">
                              {m.type === "image" ? (
                                <img src={resolvedUrl} alt={m.caption || "inspection media"} loading="lazy" className="w-full h-32 object-cover rounded" />
                              ) : m.type === "video" ? (
                                <video src={resolvedUrl} controls className="w-full h-32 object-cover rounded" />
                              ) : (
                                <audio src={resolvedUrl} controls />
                              )}
                              <figcaption className="mt-1 text-xs text-muted-foreground truncate">{m.caption}</figcaption>
                            </figure>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" onClick={() => moveFinding(f.id, -1)}>Move Up</Button>
                      <Button variant="outline" onClick={() => moveFinding(f.id, 1)}>Move Down</Button>
                      <Button variant="destructive" onClick={() => removeFinding(f.id)}>Remove</Button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <section className="rounded-md border p-3 space-y-3">
              <div className="text-sm font-medium">Additional comments</div>
              <Textarea
                placeholder="Any final notes, disclaimers, or delivery comments..."
                value={(report as any).finalComments || ""}
                onChange={(e) => setReport((prev) => (prev ? ({ ...prev, finalComments: e.target.value } as Report) : prev))}
              />
              <div className="flex gap-2">
                <Button onClick={finalize} disabled={report.status === "Final"}>
                  {report.status === "Final" ? "Finalized" : "Finalize"}
                </Button>
              </div>
            </section>
          )}

          <DefectPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            sectionKey={activeSection.key}
            onInsert={(tpl) => {
              addFindingFromTemplate(tpl as any);
              setPickerOpen(false);
            }}
          />
        </main>
      </div>
    </>
  );
};

export default ReportEditor;
