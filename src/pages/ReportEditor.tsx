// ReportEditor.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, Trash2, Upload, ChevronDown, ChevronRight, Wand2, Calendar as CalendarIcon, ImagePlus, Camera, Edit3 } from "lucide-react";
import { loadReport as loadLocalReport, saveReport as saveLocalReport } from "@/hooks/useLocalDraft";
import { useAutosave } from "@/hooks/useAutosave";
import { SectionKey, SOP_SECTIONS } from "@/constants/sop";
import { Finding, Report, Media } from "@/lib/reportSchemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InfoFieldWidget } from "@/components/reports/InfoFieldWidget";
import { toast } from "@/hooks/use-toast";
import DefectPicker from "@/components/reports/DefectPicker";
import { useEnhancedSectionGuidance } from "@/hooks/useEnhancedSectionGuidance";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport, dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { uploadFindingFiles, isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import { supabase } from "@/integrations/supabase/client";
import { contactsApi } from "@/integrations/supabase/crmApi";
import AIAnalyzeDialog from "@/components/reports/AIAnalyzeDialog";
import { CameraCapture } from "@/components/reports/CameraCapture";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCustomSections } from "@/hooks/useCustomSections";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

// Lazy load wind mitigation editor at module level
const WindMitigationEditor = React.lazy(() => import("@/components/reports/WindMitigationEditor"));

const SEVERITIES = ["Info", "Maintenance", "Minor", "Moderate", "Major", "Safety"] as const;
type Severity = typeof SEVERITIES[number];

// Utility function to convert blob URL to data URL
async function convertBlobUrlToDataUrl(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert blob URL to data URL:', error);
    throw error;
  }
}

const ReportEditor: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { guidance } = useEnhancedSectionGuidance();
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
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [annotatorOpen, setAnnotatorOpen] = React.useState(false);
  const [annotatorImage, setAnnotatorImage] = React.useState<{ url: string; mediaId: string; findingId: string } | null>(null);
  const [currentFindingId, setCurrentFindingId] = React.useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = React.useState<string>("");
  const [customSectionDialogOpen, setCustomSectionDialogOpen] = React.useState(false);

  // Custom sections hook
  const { customSections, loadCustomSections } = useCustomSections();

  // Handle contact change to update address automatically
  const handleContactChange = React.useCallback((contact: any) => {
    setSelectedContactId(contact.id);
    setReport((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      // Update client name and address from selected contact
      next.clientName = `${contact.first_name} ${contact.last_name}`;
      next.address = contact.formatted_address || contact.address || '';
      return next;
    });
  }, []);

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

      // Handle different report types
      if (r.reportType === "wind_mitigation") {
        setReport(r);
        return; // Skip sections processing for wind mitigation
      }

      // For home inspection reports, add missing sections
      if (r.reportType === "home_inspection") {
        const rr = r as any;
        const existingKeys = new Set(rr.sections.map((s: any) => s.key));
      
        // Add standard SOP sections for home inspection reports only
        SOP_SECTIONS.forEach((s) => {
          if (!existingKeys.has(s.key as SectionKey)) {
            rr.sections.push({
              id: `${rr.id}-sec-${s.key}`,
              key: s.key as SectionKey,
              title: s.name,
              findings: [],
            });
          }
        });
        
        setReport(rr);
        setActive(rr.sections[0]?.id ?? null);
      } else {
        // For wind mitigation reports, just set as is
        setReport(r);
      }
    };
    load();
  }, [id, nav, user]);

  // Separate effect for adding custom sections to avoid infinite re-renders
  React.useEffect(() => {
    if (!report || report.reportType !== "home_inspection" || !customSections.length) return;
    
    const rr = report as any;
    const existingKeys = new Set(rr.sections.map((s: any) => s.key));
    const newSections: any[] = [];
    
    // Add custom sections from database
    customSections.forEach((cs) => {
      if (!existingKeys.has(cs.section_key as SectionKey)) {
        newSections.push({
          id: `${rr.id}-sec-${cs.section_key}`,
          key: cs.section_key as SectionKey,
          title: cs.title,
          findings: [],
          info: {},
        });
      }
    });
    
    if (newSections.length > 0) {
      setReport(prev => prev ? {
        ...prev,
        sections: [...(prev as any).sections, ...newSections]
      } : prev);
    }
  }, [customSections, report?.id]);


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
    if (!report || report.reportType !== "home_inspection") return undefined;
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
      if (!prev || prev.reportType !== "home_inspection" || !activeSection) return prev;
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
    if (!activeSection) return;
    const fid = crypto.randomUUID();
    setReport((prev) => {
      if (!prev || prev.reportType !== "home_inspection") return prev;
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
    if (!activeSection) return;
    setReport((prev) => {
      if (!prev || prev.reportType !== "home_inspection") return prev;
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
      payload.imageData = await convertBlobUrlToDataUrl(m.url);
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





  

  const handleCameraCapture = async (file: File) => {
    if (!currentFindingId) return;
    
    const tempId = crypto.randomUUID();
    const localUrl = URL.createObjectURL(file);

    // Add temporary local preview
    updateFinding(currentFindingId, {
      media: [
        ...activeSection.findings.find(f => f.id === currentFindingId)?.media || [],
        { id: tempId, url: localUrl, caption: file.name, type: "image" }
      ],
    });

    // Set in mediaUrlMap so display works
    setMediaUrlMap((prev) => ({
      ...prev,
      [tempId]: localUrl,
    }));

    // Upload to Supabase if authenticated
    if (user) {
      try {
        const uploadedMedia = await uploadFindingFiles({
          userId: user.id,
          reportId: report.id,
          findingId: currentFindingId,
          files: [file]
        });
        
        if (uploadedMedia && uploadedMedia.length > 0) {
          const media = uploadedMedia[0];
          const signedUrl = await getSignedUrlFromSupabaseUrl(media.url);

          // Replace temporary with uploaded
          setReport((prev) => {
            if (!prev || prev.reportType !== "home_inspection" || !activeSection) return prev;
            const next = { ...prev };
            const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
            const finding = next.sections[sIdx].findings.find((x) => x.id === currentFindingId);
            if (finding) {
              const mediaItem = finding.media.find((m) => m.id === tempId);
              if (mediaItem) {
                mediaItem.url = media.url;
                mediaItem.type = media.type;
              }
            }
            return next;
          });

          setMediaUrlMap((prev) => ({
            ...prev,
            [tempId]: signedUrl,
          }));
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "Could not upload photo.",
          variant: "destructive",
        });
      }
    }
    
    setCameraOpen(false);
    setCurrentFindingId(null);
  };

  const handleAnnotationSave = async (annotations: string, imageBlob: Blob) => {
    if (!annotatorImage) return;

    const { findingId, mediaId } = annotatorImage;
    
    // Create new annotated file
    const annotatedFile = new File([imageBlob], `annotated-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    
    const tempId = crypto.randomUUID();
    const localUrl = URL.createObjectURL(imageBlob);

    // Add annotated version
    updateFinding(findingId, {
      media: [
        ...activeSection.findings.find(f => f.id === findingId)?.media || [],
        { 
          id: tempId, 
          url: localUrl, 
          caption: "Annotated image",
          type: "image",
          annotations,
          isAnnotated: true
        }
      ],
    });

    setMediaUrlMap((prev) => ({
      ...prev,
      [tempId]: localUrl,
    }));

    // Upload annotated version if authenticated
    if (user) {
      try {
        const uploadedMedia = await uploadFindingFiles({
          userId: user.id,
          reportId: report.id,
          findingId,
          files: [annotatedFile]
        });
        
        if (uploadedMedia && uploadedMedia.length > 0) {
          const media = uploadedMedia[0];
          const signedUrl = await getSignedUrlFromSupabaseUrl(media.url);

          setReport((prev) => {
            if (!prev || prev.reportType !== "home_inspection" || !activeSection) return prev;
            const next = { ...prev };
            const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
            const finding = next.sections[sIdx].findings.find((x) => x.id === findingId);
            if (finding) {
              const mediaItem = finding.media.find((m) => m.id === tempId);
              if (mediaItem) {
                mediaItem.url = media.url;
                mediaItem.type = media.type;
              }
            }
            return next;
          });

          setMediaUrlMap((prev) => ({
            ...prev,
            [tempId]: signedUrl,
          }));
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed", 
          description: "Could not upload annotated image.",
          variant: "destructive",
        });
      }
    }

    setAnnotatorOpen(false);
    setAnnotatorImage(null);
    toast({ title: "Annotation saved successfully" });
  };

  const finalize = () => {
    setReport((prev) => (prev ? { ...prev, status: "Final" } : prev));
    toast({ title: "Report finalized. Use Preview to print/PDF." });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !report) return;
    if (user) {
      try {
        const uploaded = await uploadFindingFiles({
          userId: user.id,
          reportId: report.id,
          findingId: "cover",
          files: [file],
        });
        if (uploaded[0]) {
          setReport((prev) => (prev ? { ...prev, coverImage: uploaded[0].url } : prev));
          const signed = await getSignedUrlFromSupabaseUrl(uploaded[0].url);
          setCoverPreviewUrl(signed);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setReport((prev) => (prev ? { ...prev, coverImage: url } : prev));
        setCoverPreviewUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const excludedKeys = ["finalize", "reportDetails", "summary"];

  if (report && report.reportType === "wind_mitigation") {
    return (
      <>
        <Seo title={`${report.title} | Wind Mitigation Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <React.Suspense fallback={<div>Loading...</div>}>
            <WindMitigationEditor 
              report={report} 
              onUpdate={setReport} 
            />
          </React.Suspense>
        </div>
      </>
    );
  }

  // Make sure we have activeSection for home inspection reports
  if (!activeSection && report?.reportType === "home_inspection") {
    return null;
  }
  return (
    <>
      <Seo title={`${report.title} | Report Editor`} />
      <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:flex-nowrap items-start gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-3">Sections</h2>
            <nav className="space-y-1">
              {/* Report Details - Always first */}
              {(() => {
                const reportDetailsSection = SOP_SECTIONS.find(s => s.key === 'report_details');
                if (reportDetailsSection) {
                  return (
                    <button
                      key={reportDetailsSection.key}
                      className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 border ${showDetails ? "bg-accent" : "bg-background"}`}
                      onClick={() => setShowDetails(true)}
                    >
                      <span className="truncate">{reportDetailsSection.name}</span>
                    </button>
                  );
                }
                return null;
              })()}
              
              {/* All other SOP sections */}
              {SOP_SECTIONS.filter(s => s.key !== 'report_details').map((s) => {
                const sec = report.reportType === "home_inspection" ? report.sections.find((x) => x.key === s.key) : null;
                if (!sec) return null;
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
              
              {/* Custom Sections */}
              {customSections.length > 0 && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground font-medium mb-2 px-3">Custom Sections</p>
                  </div>
                  {customSections.map((cs) => {
                    // Find or create the section in the report
                    let sec = report.reportType === "home_inspection" ? report.sections.find((x) => x.key === cs.section_key) : null;
                    if (!sec) {
                      // Auto-create the custom section if it doesn't exist
                      sec = {
                        id: `${cs.section_key}_${Date.now()}`,
                        key: cs.section_key as SectionKey,
                        title: cs.title,
                        findings: [],
                        info: {}
                      };
                      // Add it to the report
                      setReport(prev => {
                        if (!prev || prev.reportType !== "home_inspection") return prev;
                        return {
                          ...prev,
                          sections: [...prev.sections, sec!]
                        };
                      });
                    }
                    const count = sec.findings.length;
                    return (
                      <button
                        key={cs.id}
                        className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 border ${active === sec.id ? "bg-accent" : "bg-background"}`}
                        onClick={() => { setShowDetails(false); setActive(sec.id); }}
                      >
                        <span className="truncate">{cs.title}</span>
                        {count > 0 && (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-[10px]">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
              
              {/* Add Section Button */}
              {user && (
                <button
                  className="w-full flex items-center gap-2 text-left text-sm rounded-md px-3 py-2 border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  onClick={() => setCustomSectionDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </button>
              )}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          {!showDetails && !excludedKeys.includes(activeSection.key) && (
            <>
              <div className="flex justify-between border-b mb-4">
                <div className="mb-4 flex gap-6">
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
                <Button
                  variant="secondary"
                  onClick={() => nav(`/reports/${report.id}/preview`)}
                >
                  Preview Report
                </Button>
          
                
              </div>

              {activeTab === "info" && (
                <section className="mb-4 rounded-md border p-4 space-y-4">
                  {guidance[activeSection.key]?.infoFields?.length > 0 ? (
                    guidance[activeSection.key].infoFields.map((field, idx) => {
                      const fieldName = typeof field === "string" ? field : field.name;
                      const fieldLabel = typeof field === "string" ? field : field.label;
                      
                      return (
                        <InfoFieldWidget
                          key={idx}
                          field={field}
                          value={activeSection.info?.[fieldName] || ""}
                          onChange={(val) => {
                            setReport((prev) => {
                              if (!prev || prev.reportType !== "home_inspection") return prev;
                              const next = { ...prev };
                              const sec = next.sections.find(s => s.id === activeSection.id);
                              if (!sec) return prev;
                              sec.info = { ...(sec.info || {}), [fieldName]: val };
                              return next;
                            });
                          }}
                        />
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No information fields for this section.</p>
                  )}
                </section>
              )}

              {activeTab === "observations" && (
                <>
                  <div className="flex gap-6 justify-between mb-4">
                    <section className="mb-4 flex-1 rounded-md border p-3 w-100">
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
                      <Button onClick={() => setPickerOpen(true)}>Add Defect</Button>
                    </div>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFinding(f.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

  {/* Delete button */}
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

  {/* Annotate button */}
  {m.type === "image" && (
    <button
      type="button"
      className="absolute bottom-1 left-1 bg-white rounded-full p-1 shadow"
                       onClick={() => {
                        const currentFinding = activeSection?.findings.find(f => 
                          f.media.some(media => media.id === m.id)
                        );
                        
                        if (!currentFinding) {
                          toast({ title: "Error", description: "Could not find the finding for this media item", variant: "destructive" });
                          return;
                        }
                        
                        nav(`/reports/${id}/annotate/${currentFinding.id}/${m.id}`);
                      }}
    >
      <Edit3 className="w-4 h-4 text-orange-500" />
    </button>
  )}

  {/* AI Analysis button */}
  <button
    type="button"
    className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow"
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
                                <div className="flex gap-2">
                                  <label className="w-24 h-24 border rounded flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-accent">
                                    <input
    type="file"
    className="hidden"
    accept="image/*,video/*"
    onChange={async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const tempId = crypto.randomUUID();
      const localUrl = URL.createObjectURL(file);

      // 1️⃣ Add temporary local preview
      updateFinding(f.id, {
        media: [
          ...f.media,
          { id: tempId, url: localUrl, caption: file.name }
        ],
      });

      // Also set it in mediaUrlMap so <img> works
      setMediaUrlMap((prev) => ({
        ...prev,
        [tempId]: localUrl,
      }));

      // 2️⃣ Upload to Supabase (only if user is authenticated)
      if (!user) continue; // Skip upload for unauthenticated users
      
      try {
        const uploadedMedia = await uploadFindingFiles({
          userId: user.id,
          reportId: report.id,
          findingId: f.id,
          files: [file]
        });
        
        if (!uploadedMedia || uploadedMedia.length === 0) {
          toast({
            title: "Upload failed",
            description: "Could not upload file.",
            variant: "destructive",
          });
          continue;
        }
        
        const media = uploadedMedia[0];
        // 3️⃣ Get a signed URL from Supabase
        const signedUrl = await getSignedUrlFromSupabaseUrl(media.url);

      // 4️⃣ Replace temporary local preview with the signed URL
      setReport((prev) => {
        if (!prev || prev.reportType !== "home_inspection" || !activeSection) return prev;
        const next = { ...prev };
        const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
        const finding = next.sections[sIdx].findings.find((x) => x.id === f.id);
        if (finding) {
          const mediaItem = finding.media.find((m) => m.id === tempId);
          if (mediaItem) {
            mediaItem.url = media.url;
            mediaItem.type = media.type;
          }
        }
        return next;
      });

        // 5️⃣ Update mediaUrlMap so display uses the signed URL
        setMediaUrlMap((prev) => ({
          ...prev,
          [tempId]: signedUrl,
        }));
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: "Could not upload file.",
          variant: "destructive",
        });
      }
    }
  }}
/>

                                    <ImagePlus className="w-6 h-6" />
                                  </label>
                                  
                                  {/* Camera button */}
                                  <button
                                    type="button"
                                    className="w-24 h-24 border rounded flex items-center justify-center text-sm text-muted-foreground hover:bg-accent"
                                    onClick={() => {
                                      setCurrentFindingId(f.id);
                                      setCameraOpen(true);
                                    }}
                                  >
                                    <Camera className="w-6 h-6" />
                                  </button>
                                </div>
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

          {showDetails && (
            <section className="rounded-md border p-4 space-y-4">
              <h2 className="text-lg font-medium">Report Details</h2>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Image</Label>
                {coverPreviewUrl && (
                  <img src={coverPreviewUrl} alt="Cover" className="h-40 w-auto rounded border" />
                )}
                <Input type="file" accept="image/*" onChange={handleCoverImageUpload} />
              </div>
              {guidance['report_details']?.infoFields?.length > 0 ? (
                guidance['report_details'].infoFields.map((field, idx) => {
                  const fieldName = typeof field === "string" ? field : field.name;
                  const reportDetailsSection = report.reportType === "home_inspection" ? report.sections.find(s => s.key === 'report_details') : null;
                  
                  // Handle report-level fields vs section info fields
                  const isReportLevelField = ['title', 'client_name', 'address', 'inspection_date'].includes(fieldName);
                  const currentValue = isReportLevelField 
                    ? (() => {
                        switch(fieldName) {
                          case 'title': return report.title;
                          case 'client_name': return report.clientName;
                          case 'address': return report.address;
                          case 'inspection_date': return report.inspectionDate;
                          default: return '';
                        }
                      })()
                    : reportDetailsSection?.info?.[fieldName] || "";
                  
                  return (
                    <InfoFieldWidget
                      key={idx}
                      field={field}
                      value={fieldName === 'client_name' ? selectedContactId || currentValue : currentValue}
                      onChange={(val) => {
                        setReport((prev) => {
                          if (!prev) return prev;
                          const next = { ...prev };
                          
                          if (isReportLevelField) {
                            // Update report-level fields
                            switch(fieldName) {
                              case 'title':
                                next.title = val;
                                break;
                              case 'client_name':
                                if (field.widget === 'contact_lookup') {
                                  setSelectedContactId(val);
                                } else {
                                  next.clientName = val;
                                }
                                break;
                              case 'address':
                                next.address = val;
                                break;
                              case 'inspection_date':
                                next.inspectionDate = val;
                                break;
                            }
                          } else {
                            // Update section info fields
                            if (next.reportType === "home_inspection") {
                              let sec = next.sections.find(s => s.key === 'report_details');
                              if (!sec) {
                                // Create report_details section if it doesn't exist
                                sec = {
                                  id: `${prev.id}-sec-report-details`,
                                  key: 'report_details' as any,
                                  title: 'Report Details',
                                  findings: [],
                                  info: {}
                                };
                                next.sections.push(sec);
                              }
                              sec.info = { ...(sec.info || {}), [fieldName]: val };
                            }
                          }
                          return next;
                        });
                      }}
                      onContactChange={fieldName === 'client_name' && field.widget === 'contact_lookup' ? handleContactChange : undefined}
                    />
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No report details fields configured.</p>
              )}
            </section>
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
              if (!activeSection) return;
              const fid = crypto.randomUUID();
              setReport((prev) => {
                if (!prev || prev.reportType !== "home_inspection") return prev;
                const next = { ...prev };
                const sIdx = next.sections.findIndex((s) => s.id === activeSection.id);
                next.sections[sIdx].findings.unshift({
                  id: fid,
                  title: tpl.title,
                  severity: (tpl.severity as Severity),
                  narrative: tpl.narrative,
                  recommendation: tpl.recommendation || "",
                  mediaGuidance: tpl.mediaGuidance || "",
                  defectId: tpl.defectId || null,
                  media: [],
                  includeInSummary: false,
                } as Finding);
                return { ...next };
              });
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

          <CameraCapture
            isOpen={cameraOpen}
            onClose={() => {
              setCameraOpen(false);
              setCurrentFindingId(null);
            }}
            onCapture={handleCameraCapture}
          />

          
          <CustomSectionDialog
            open={customSectionDialogOpen}
            onOpenChange={setCustomSectionDialogOpen}
            userId={user?.id || ""}
            onSectionCreated={() => {
              loadCustomSections();
              setCustomSectionDialogOpen(false);
            }}
          />
        </main>
      </div>
    </>
  );
};

export default ReportEditor;
