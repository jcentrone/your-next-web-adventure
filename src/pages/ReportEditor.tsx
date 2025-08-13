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

  // Resolve cover image preview when authenticated and using Supabase URL
  React.useEffect(() => {
    if (!user) return;
    if (!report?.coverImage) return;
    if (!isSupabaseUrl(report.coverImage)) {
      setCoverPreviewUrl(report.coverImage);
      return;
    }
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

  const openAiDialogForFinding = (finding: Finding) => {
    const images = (finding.media || [])
      .filter((m) => m.type === "image")
      .map((m) => ({
        id: m.id,
        url: mediaUrlMap[m.id] || m.url,
        caption: m.caption,
      }));
    if (images.length === 0) {
      toast({ title: "Add an image first", description: "Attach a photo to analyze.", variant: "destructive" });
      return;
    }
    setAiDialogImages(images);
    setAiDialogFindingId(finding.id);
    setAiDialogOpen(true);
  };

  const blobUrlToDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
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

  return (
    <>
      <Seo
        title={`${report.title} | Report Editor`}
        description={`Editing report for ${report.clientName} at ${report.address}`}
        canonical={window.location.origin + `/reports/${report.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:flex-nowrap items-start gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-3">Sections</h2>
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 border ${showDetails ? "bg-accent" : "bg-background"}`}
                onClick={() => setShowDetails(true)}
                aria-current={showDetails}
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
        <main className="flex-1 min-w-0">
          {showDetails && (
            <>
              <header className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-xl font-semibold flex-1">Report Details</h1>
                <Button variant="outline" onClick={() => nav(`/reports/${report.id}/preview`)}>Preview</Button>
              </header>
              {/* Report details panel */}
          <section className="mb-4 rounded-md border p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <Input value={report.title} onChange={(e) => setReport((prev) => (prev ? { ...prev, title: e.target.value } : prev))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Client Name</label>
                <Input value={report.clientName} onChange={(e) => setReport((prev) => (prev ? { ...prev, clientName: e.target.value } : prev))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Address</label>
                <Input value={report.address} onChange={(e) => setReport((prev) => (prev ? { ...prev, address: e.target.value } : prev))} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground">Inspection Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start font-normal", !report.inspectionDate && "text-muted-foreground")}> 
                      {report.inspectionDate ? new Date(report.inspectionDate).toLocaleDateString() : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={report.inspectionDate ? new Date(report.inspectionDate) : undefined}
                      onSelect={(d) => d && setReport((prev) => (prev ? { ...prev, inspectionDate: d.toISOString() } : prev))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cover Image</label>
                <div className="flex items-center gap-3">
                  <input id="cover-file" type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                    const file = (e.target.files || [])[0];
                    if (!file) return;
                    if (user) {
                      try {
                        const uploaded = await uploadFindingFiles({ userId: user.id, reportId: report.id, findingId: "cover", files: [file] });
                        const first = uploaded[0];
                        const signed = await getSignedUrlFromSupabaseUrl(first.url);
                        setCoverPreviewUrl(signed);
                        setReport((prev) => (prev ? { ...prev, coverImage: first.url } : prev));
                        toast({ title: "Cover image uploaded" });
                      } catch (err) {
                        console.error(err);
                        toast({ title: "Upload failed", variant: "destructive" });
                      }
                    } else {
                      const url = URL.createObjectURL(file);
                      setCoverPreviewUrl(url);
                      setReport((prev) => (prev ? { ...prev, coverImage: url } : prev));
                    }
                    e.currentTarget.value = "";
                  }} />
                  <Button variant="secondary" asChild>
                    <label htmlFor="cover-file" className="cursor-pointer inline-flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Upload cover
                    </label>
                  </Button>
                  {(coverPreviewUrl || report.coverImage) && (
                    <img src={coverPreviewUrl || report.coverImage} alt="Cover preview" className="h-12 w-20 object-cover rounded border" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Preview Template</label>
                <Select value={report.previewTemplate} onValueChange={(v) => setReport((prev) => (prev ? { ...prev, previewTemplate: v as any } : prev))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

            </>
          )}

          {!showDetails && (
            <>
              <header className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-xl font-semibold flex-1">{activeSection.title}</h1>
                <Button variant="outline" onClick={() => nav(`/reports/${report.id}/preview`)}>Preview</Button>
                <Button onClick={() => setPickerOpen(true)}>Add Observation</Button>
              </header>

          {activeSection.key !== "finalize" ? (
            <>
              <section className="mb-4 rounded-md border p-3">
                <details>
                  <summary className="text-sm font-medium cursor-pointer">What to inspect (InterNACHI)</summary>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(guidance[activeSection.key] || []).map((item, idx) => (
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
                        onChange={(e) => updateFinding(f.id, { severity: e.target.value as any })}
                        aria-label="Severity"
                      >
                        {SEVERITIES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                        aria-label={collapsed[f.id] ? "Expand" : "Collapse"}
                        title={collapsed[f.id] ? "Expand" : "Collapse"}
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

                        {f.mediaGuidance && (
                          <p className="text-xs text-muted-foreground mt-3">Media guidance: {f.mediaGuidance}</p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            id={`file-${f.id}`}
                            type="file"
                            accept="image/*,video/*,audio/*"
                            multiple
                            className="sr-only"
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
                                  // Immediately resolve signed URLs so previews work without refresh
                                  try {
                                    const entries = await Promise.all(
                                      uploaded.map(async (m) => [m.id, await getSignedUrlFromSupabaseUrl(m.url)] as const)
                                    );
                                    setMediaUrlMap((prev) => {
                                      const next = { ...prev };
                                      for (const [mid, url] of entries) next[mid] = url;
                                      return next;
                                    });
                                  } catch (signErr) {
                                    console.error("Failed to sign media URLs", signErr);
                                  }
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
                          <Button variant="secondary" asChild>
                            <label htmlFor={`file-${f.id}`} className="cursor-pointer inline-flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Add media
                            </label>
                          </Button>

                          <Button variant="secondary" onClick={() => openAiDialogForFinding(f)} className="inline-flex items-center gap-2">
                            <Wand2 className="h-4 w-4" />
                            AI Analysis
                          </Button>

                          <span className="text-xs text-muted-foreground">Images, videos, or audio</span>
                        </div>

                        {f.media.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {f.media.map((m) => {
                              const resolvedUrl = mediaUrlMap[m.id] || m.url;
                              return (
                                <figure key={m.id} className="group relative rounded border p-2">
                                  {m.type === "image" ? (
                                    <div className="relative">
                                      <img src={resolvedUrl} alt={m.caption || "inspection media"} loading="lazy" className="w-full h-32 object-cover rounded" />
                                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                        <Button size="sm" variant="outline" onClick={() => setZoomImage({ url: resolvedUrl, caption: m.caption })}>
                                          <ZoomIn className="h-4 w-4 mr-1" /> Zoom
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => updateFinding(f.id, { media: f.media.filter((x) => x.id !== m.id) })}>
                                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                                        </Button>
                                      </div>
                                    </div>
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
                      </>
                    )}
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
            </>
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
