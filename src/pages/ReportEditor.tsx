// ReportEditor.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, Trash2, Upload, ChevronDown, ChevronRight, Wand2, Calendar as CalendarIcon, ImagePlus } from "lucide-react";
import { loadReport as loadLocalReport, saveReport as saveLocalReport } from "@/hooks/useLocalDraft";
import { useAutosave } from "@/hooks/useAutosave";
import { SectionKey, SOP_SECTIONS } from "@/constants/sop";
import { Finding, Report, Media } from "@/lib/reportSchemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import DefectPicker from "@/components/reports/DefectPicker";
import { useSectionGuidance } from "@/hooks/useSectionGuidance";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport, dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { uploadFindingFiles, isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import { supabase } from "@/integrations/supabase/client";
import AIAnalyzeDialog from "@/components/reports/AIAnalyzeDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const SEVERITIES = ["Info", "Maintenance", "Minor", "Moderate", "Major", "Safety"] as const;
type Severity = typeof SEVERITIES[number];

const ReportEditor: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { guidance } = useSectionGuidance();
  const [report, setReport] = React.useState<Report | null>(null);
  const [active, setActive] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"info" | "observations">("info");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});
  const [zoomImage, setZoomImage] = React.useState<{ url: string; caption?: string } | null>(null);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false);
  const [aiDialogImages, setAiDialogImages] = React.useState<{ id: string; url: string; caption?: string }[]>([]);
  const [aiDialogFindingId, setAiDialogFindingId] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = React.useState<string>("");
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      let r: Report | null = null;
      try {
        if (user) r = await dbGetReport(id);
        else r = loadLocalReport(id);
      } catch (e) {
        console.error(e);
      }
      if (!r) return nav("/reports");

      const rr: Report = {
        ...r,
        finalComments: (r as any).finalComments ?? "",
        sections: [...r.sections],
      } as Report;
      const existingKeys = new Set(rr.sections.map((s) => s.key));
      SOP_SECTIONS.forEach((s) => {
        if (!existingKeys.has(s.key as SectionKey)) {
          rr.sections.push({
            id: `${rr.id}-sec-${s.key}`,
            key: s.key as SectionKey,
            title: s.name,
            findings: [],
          } as any);
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
      saveLocalReport(value);
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

  const activeSection = React.useMemo(() => {
    if (!report) return undefined;
    return report.sections.find((s) => s.id === active) ?? report.sections[0];
  }, [report, active]);

  React.useEffect(() => {
    if (!report || !activeSection) return;
    if (!user) return;
    const medias = activeSection.findings.flatMap((f) => f.media).filter((m) => isSupabaseUrl(m.url));
    if (medias.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        medias.map(async (m) => [m.id, await getSignedUrlFromSupabaseUrl(m.url)] as const)
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

  React.useEffect(() => {
    if (!user || !report?.coverImage) return;
    if (!isSupabaseUrl(report.coverImage)) return setCoverPreviewUrl(report.coverImage);
    let cancelled = false;
    (async () => {
      try {
        const signed = await getSignedUrlFromSupabaseUrl(report.coverImage!);
        if (!cancelled) setCoverPreviewUrl(signed);
      } catch (e) {
        console.error("Failed to sign cover image", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, report?.coverImage]);

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

  const removeFinding = (fid: string) => {
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
      next.sections[sIdx].findings = next.sections[sIdx].findings.filter((f) => f.id !== fid);
      return { ...next };
    });
  };

  const handleAIAnalyze = async (imageId: string) => {
  if (!aiDialogFindingId) return;
  const section = activeSection;
  if (!section) return;
  const f = section.findings.find((x) => x.id === aiDialogFindingId);
  if (!f) return;
  const m = f.media.find((x) => x.id === imageId);
  if (!m) return;

  setAiLoading(true);

  try {
    const payload: any = {
      context: `${report.title} • ${section.title} • ${f.title}`,
    };

    if (isSupabaseUrl(m.url)) {
      const signed = await getSignedUrlFromSupabaseUrl(m.url);
      payload.imageUrl = signed;
    } else if (m.url.startsWith("http")) {
      payload.imageUrl = m.url;
    } else {
      // Likely a blob: URL from local uploads when unauthenticated
      payload.imageData = await blobUrlToDataUrl(m.url);
    }

    const { data, error } = await (supabase as any).functions.invoke("analyze-image", {
      body: payload,
    });
    if (error) throw error;

    const structured = (data?.structured ?? null) as
      | { title?: string; observation?: string; implications?: string; severity?: string; recommendation?: string }
      | null;
    const raw: string = data?.analysis || "";

    // Decide title: only overwrite if currently empty or default
    let nextTitle = f.title;
    if (!nextTitle || nextTitle.trim() === "" || nextTitle.trim().toLowerCase() === "new observation") {
      if (structured?.title) nextTitle = structured.title;
    }

    // Build narrative from observation + implications (or fall back to raw)
    const combined = structured
      ? [structured.observation, structured.implications].filter(Boolean).join("\n\n")
      : raw || "No analysis returned.";
    const divider = f.narrative?.trim() ? "\n\n" : "";
    const nextNarrative = `${f.narrative || ""}${divider}${combined}`;

    // Map severity if provided
    let nextSeverity = f.severity as Severity;
    if (structured?.severity) {
      const found = (SEVERITIES as readonly string[]).find(
        (s) => s.toLowerCase() === String(structured.severity).toLowerCase()
      );
      if (found) nextSeverity = found as Severity;
    }

    // Put recommendation in its field; append if something already exists
    let nextRecommendation = f.recommendation || "";
    if (structured?.recommendation) {
      nextRecommendation = nextRecommendation?.trim()
        ? `${nextRecommendation}\n\n${structured.recommendation}`
        : structured.recommendation;
    }

    updateFinding(f.id, {
      title: nextTitle,
      narrative: nextNarrative,
      severity: nextSeverity,
      recommendation: nextRecommendation,
    });
    toast({ title: "AI analysis applied", description: "Title, severity, narrative and recommendation updated." });
    setAiDialogOpen(false);
  } catch (e) {
    console.error("AI analysis failed", e);
    toast({ title: "AI analysis failed", description: "Please try again.", variant: "destructive" });
  } finally {
    setAiLoading(false);
  }
};





  

  const finalize = () => {
    setReport((prev) => (prev ? { ...prev, status: "Final" } : prev));
    toast({ title: "Report finalized. Use Preview to print/PDF." });
  };

  const excludedKeys = ["finalize", "reportDetails", "summary"];

  return (
    <>
      <Seo title={`${report.title} | Report Editor`} />
      <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:flex-nowrap items-start gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-3">Sections</h2>
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 border ${showDetails ? "bg-accent" : "bg-background"}`}
                onClick={() => setShowDetails(true)}
              >
                <span className="truncate">Report Details</span>
              </button>
              {SOP_SECTIONS.map((s) => {
                const sec = report.sections.find((x) => x.key === s.key)!;
                const count = sec.findings.length;
                return (
                  <button
                    key={s.key}
                    className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 border ${active === sec.id ? "bg-accent" : "bg-background"}`}
                    onClick={() => { setShowDetails(false); setActive(sec.id); }}
                  >
                    <span className="truncate">{s.name}</span>
                    {count > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-[10px]">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          {!showDetails && !excludedKeys.includes(activeSection.key) && (
            <>
              <div className="mb-4 border-b flex gap-6">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`pb-2 border-b-2 ${activeTab === "info" ? "border-primary font-medium" : "border-transparent text-muted-foreground"}`}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveTab("observations")}
                  className={`pb-2 border-b-2 ${activeTab === "observations" ? "border-primary font-medium" : "border-transparent text-muted-foreground"}`}
                >
                  Observations
                </button>
              </div>

              {activeTab === "info" && (
                <section className="mb-4 rounded-md border p-4 space-y-4">
                  {guidance[activeSection.key]?.infoFields?.length > 0 ? (
                    guidance[activeSection.key].infoFields.map((field, idx) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium">{field}</label>
                        <Input
                          value={activeSection.info?.[field] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReport((prev) => {
                              if (!prev) return prev;
                              const next = { ...prev };
                              const sec = next.sections.find(s => s.id === activeSection.id);
                              if (!sec) return prev;
                              sec.info = { ...(sec.info || {}), [field]: val };
                              return next;
                            });
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No information fields for this section.</p>
                  )}
                </section>
              )}

              {activeTab === "observations" && (
                <>
                  <section className="mb-4 rounded-md border p-3">
                    <details>
                      <summary className="text-sm font-medium cursor-pointer">What to inspect (InterNACHI)</summary>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {(guidance[activeSection.key]?.observationItems || []).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  </section>
                  <div className="flex justify-between mb-4">
                    <Button
                      variant="secondary"
                      onClick={() => nav(`/reports/${report.id}/preview`)}
                    >
                      Preview Report
                    </Button>
                    <Button onClick={() => setPickerOpen(true)}>+ Add Observation</Button>
                  </div>

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
                          />
                          <select
                            className="border rounded-md h-10 px-2 text-sm"
                            value={f.severity}
                            onChange={(e) => updateFinding(f.id, { severity: e.target.value as any })}
                          >
                            {SEVERITIES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCollapsed((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                          >
                            {collapsed[f.id] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                        {!collapsed[f.id] && (
                          <>
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
                            <div className="mt-3">
                              <label className="block text-sm font-medium mb-1">Media</label>
                              <div className="flex flex-wrap gap-3">
                                {f.media.map((m) => (
                                  <div key={m.id} className="relative w-24 h-24 border rounded overflow-hidden">
                                    <img
                                      src={mediaUrlMap[m.id] || m.url}
                                      alt={m.caption || "Media"}
                                      className="w-full h-full object-cover cursor-pointer"
                                      onClick={() => setZoomImage({ url: mediaUrlMap[m.id] || m.url, caption: m.caption })}
                                    />
                                    <button
                                      type="button"
                                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                                      onClick={() =>
                                        updateFinding(f.id, {
                                          media: f.media.filter((x) => x.id !== m.id),
                                        })
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="absolute bottom-1 left-1 bg-white rounded-full p-1 shadow"
                                      onClick={() => {
                                        setAiDialogFindingId(f.id);
                                        setAiDialogImages([{ id: m.id, url: mediaUrlMap[m.id] || m.url, caption: m.caption }]);
                                        setAiDialogOpen(true);
                                      }}
                                    >
                                      <Wand2 className="w-4 h-4 text-blue-500" />
                                    </button>
                                  </div>
                                ))}
                            
                                {/* Add new media */}
                                <label className="w-24 h-24 border rounded flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-accent">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={async (e) => {
                                      const files = e.target.files;
                                      if (!files || files.length === 0) return;
                            
                                      const uploaded: Media[] = [];
                                      for (const file of Array.from(files)) {
                                        // Upload to Supabase
                                        const { data, error } = await uploadFindingFiles(file);
                                        if (error) {
                                          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                                          continue;
                                        }
                                        uploaded.push({
                                          id: crypto.randomUUID(),
                                          url: data?.path || "",
                                          caption: file.name,
                                        });
                                      }
                            
                                      updateFinding(f.id, { media: [...f.media, ...uploaded] });
                                    }}
                                  />
                                  <ImagePlus className="w-6 h-6" />
                                </label>
                              </div>
                            </div>

                          </>
                        )}
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {activeSection.key === "finalize" && (
            <section className="rounded-md border p-3 space-y-3">
              <div className="text-sm font-medium">Additional comments</div>
              <Textarea
                placeholder="Any final notes..."
                value={(report as any).finalComments || ""}
                onChange={(e) => setReport((prev) => (prev ? ({ ...prev, finalComments: e.target.value } as Report) : prev))}
              />
              <Button onClick={finalize} disabled={report.status === "Final"}>
                {report.status === "Final" ? "Finalized" : "Finalize"}
              </Button>
            </section>
          )}

          <DefectPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            sectionKey={activeSection.key}
            onInsert={(tpl) => {
              addFindingFromTemplate(tpl as any);
              if (tpl.defectId) setPickerOpen(false);
            }}
          />

          <Dialog open={!!zoomImage} onOpenChange={(open) => { if (!open) setZoomImage(null); }}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{zoomImage?.caption || "Image preview"}</DialogTitle>
              </DialogHeader>
              {zoomImage && (
                <img src={zoomImage.url} alt={zoomImage.caption || "Zoomed media"} className="w-full h-auto rounded" />
              )}
            </DialogContent>
          </Dialog>

          <AIAnalyzeDialog
            open={aiDialogOpen}
            onOpenChange={setAiDialogOpen}
            images={aiDialogImages}
            loading={aiLoading}
            onConfirm={handleAIAnalyze}
          />
        </main>
      </div>
    </>
  );
};

export default ReportEditor;
