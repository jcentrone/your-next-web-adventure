// ReportEditor.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ZoomIn, Trash2, Upload, ChevronDown, ChevronRight, Wand2, Calendar as CalendarIcon, ImagePlus, Camera, Edit3 } from "lucide-react";
import { loadReport as loadLocalReport, saveReport as saveLocalReport } from "@/hooks/useLocalDraft";
import { useAutosave } from "@/hooks/useAutosave";
import { SectionKey, SOP_SECTIONS } from "@/constants/sop";
import { Finding, Report, Media } from "@/lib/reportSchemas";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoFieldWidget } from "@/components/reports/InfoFieldWidget";
import { toast } from "@/hooks/use-toast";
import DefectPicker from "@/components/reports/DefectPicker";
import { useEnhancedSectionGuidance } from "@/hooks/useEnhancedSectionGuidance";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport, dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { uploadFindingFiles, isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { contactsApi, appointmentsApi } from "@/integrations/supabase/crmApi";
import { useQuery } from "@tanstack/react-query";
import AIAnalyzeDialog from "@/components/reports/AIAnalyzeDialog";
import { CameraCapture } from "@/components/reports/CameraCapture";
import { KonvaAnnotator } from "@/components/reports/KonvaAnnotator";
import { CategoryAwareReportEditor } from "@/components/reports/CategoryAwareReportEditor";
import { getReportCategory, isDefectBasedReport } from "@/constants/reportCategories";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import type { Contact } from "@/lib/crmSchemas";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCustomSections } from "@/hooks/useCustomSections";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import ContactMultiSelect from "@/components/contacts/ContactMultiSelect";
import FEATURE_FLAGS from "@/constants/featureFlags";

// Lazy load wind mitigation editor at module level
const WindMitigationEditor = React.lazy(() => import("@/components/reports/WindMitigationEditor"));
const FlFourPointEditor = React.lazy(() => import("@/components/reports/FlFourPointEditor"));
const TxWindstormEditor = React.lazy(() => import("@/components/reports/TxWindstormEditor"));
const CaWildfireEditor = React.lazy(() => import("@/components/reports/CaWildfireEditor"));
const RoofCertificationEditor = React.lazy(() => import("@/components/reports/RoofCertificationEditor"));
const ManufacturedHomeEditor = React.lazy(() => import("@/components/reports/ManufacturedHomeEditor"));

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
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [selectedRecipients, setSelectedRecipients] = React.useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = React.useState<Contact[]>([]);
  const [sendingReport, setSendingReport] = React.useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [selectApptDialogOpen, setSelectApptDialogOpen] = React.useState(false);
  const [createApptDialogOpen, setCreateApptDialogOpen] = React.useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string>("");
  const [newApptTitle, setNewApptTitle] = React.useState("");
  const [newApptDate, setNewApptDate] = React.useState("");
  const [newApptAddress, setNewApptAddress] = React.useState("");
  const [linkDialogDismissed, setLinkDialogDismissed] = React.useState(false);

  // Get templates for the report type
  const { templates } = useReportTemplates(report?.reportType);
  const reportTemplate = templates.find(t => t.is_default) || templates[0] || null;

  // Check if this is a category-aware report
  const reportCategory = report ? getReportCategory(report.reportType) : null;

  // Readiness checks for enabling the new category-aware editor
  // Toggle these once the corresponding features reach parity with the legacy editor
  const hasTabs = false; // TODO: implement tabbed navigation in CategoryAwareReportEditor
  const hasTemplates = !!reportTemplate; // templates must exist for the report type
  const hasAnnotation = false; // TODO: support image annotation workflow
  const hasAI = false; // TODO: integrate AI assistance

  const categoryEditorReady =
    FEATURE_FLAGS.ENABLE_CATEGORY_REPORT_EDITOR &&
    hasTabs &&
    hasTemplates &&
    hasAnnotation &&
    hasAI;

  // Only use the new editor when all readiness checks pass
  const shouldUseCategoryEditor = reportCategory && categoryEditorReady;

  const { data: recipientOptions = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: emailDialogOpen && !!user,
  });

  React.useEffect(() => {
    if (emailDialogOpen) {
      // Cast report to any since contact_id exists in DB but not in schema
      const reportWithContactId = report as any;
      setSelectedRecipients(reportWithContactId?.contact_id ? [reportWithContactId.contact_id] : []);
    }
  }, [emailDialogOpen, report]);

  // Custom sections hook
  const { customSections, loadCustomSections } = useCustomSections();

  const { data: upcomingAppointments = [], error: appointmentsError } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      console.log("Fetching upcoming appointments for user:", user!.id);
      const appointments = await appointmentsApi.getUpcoming(user!.id, 50);
      console.log("Retrieved appointments:", appointments);
      return appointments;
    },
    enabled: selectApptDialogOpen && !!user,
  });

  React.useEffect(() => {
    if (appointmentsError) {
      console.error("Appointments fetch error:", appointmentsError);
    }
  }, [appointmentsError]);

  React.useEffect(() => {
    if (report && !report.appointmentId && !linkDialogDismissed && user) {
      setLinkDialogOpen(true);
    } else {
      setLinkDialogOpen(false);
    }
  }, [report, linkDialogDismissed, user]);

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

  const openSelectDialog = () => {
    setSelectApptDialogOpen(true);
    setLinkDialogOpen(false);
  };

  const openCreateDialog = () => {
    if (report) {
      setNewApptTitle(report.title);
      setNewApptDate(report.inspectionDate ? new Date(report.inspectionDate).toISOString().slice(0,16) : new Date().toISOString().slice(0,16));
      setNewApptAddress(report.address);
    }
    setCreateApptDialogOpen(true);
    setLinkDialogOpen(false);
  };

  const handleLinkExisting = async () => {
    if (!report || !selectedAppointmentId) return;
    try {
      await dbUpdateReport({ ...report, appointmentId: selectedAppointmentId });
      await appointmentsApi.update(selectedAppointmentId, { report_id: report.id });
      setReport((prev) => (prev ? ({ ...prev, appointmentId: selectedAppointmentId } as Report) : prev));
      toast({ title: "Appointment linked" });
      setSelectApptDialogOpen(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to link appointment", description: e?.message || "Please try again." });
    }
  };

  const handleCreateAppointment = async () => {
    if (!report || !user) return;
    try {
      const appt = await appointmentsApi.create({
        user_id: user.id,
        title: newApptTitle,
        appointment_date: new Date(newApptDate).toISOString(),
        address: newApptAddress,
        contact_id: report.contactIds?.[0] || undefined,
      });
      await appointmentsApi.update(appt.id, { report_id: report.id });
      await dbUpdateReport({ ...report, appointmentId: appt.id });
      setReport((prev) => (prev ? ({ ...prev, appointmentId: appt.id } as Report) : prev));
      toast({ title: "Appointment created and linked" });
      setCreateApptDialogOpen(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to create appointment", description: e?.message || "Please try again." });
    }
  };

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
      if (r.reportType !== "home_inspection") {
        setReport(r);
        return; // Skip sections processing for non-home-inspection types
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

  const handleAnnotateImage = (findingId: string, mediaId: string, mediaUrl: string) => {
    setAnnotatorImage({
      url: mediaUrl,
      mediaId,
      findingId
    });
    setAnnotatorOpen(true);
  };

  if (!report) return null;

  // Use category-aware editor if template is available
  if (shouldUseCategoryEditor) {
    return (
      <>
        <Seo title={`${report.title} • ${REPORT_TYPE_LABELS[report.reportType]}`} />
        <div className="flex min-h-screen bg-background">
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{report.title}</h1>
                  <p className="text-muted-foreground">
                    {REPORT_TYPE_LABELS[report.reportType]} • {reportCategory === "defect_based" ? "Defect-Based" : "Form-Based"} Report
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => nav("/reports")}>
                    Back to Reports
                  </Button>
                  <Button onClick={() => nav(`/reports/${report.id}/preview`)}>
                    Preview Report
                  </Button>
                </div>
              </div>

              {/* Category-Aware Editor */}
              <CategoryAwareReportEditor
                report={report}
                onReportChange={setReport}
                template={reportTemplate}
                onAnnotate={handleAnnotateImage}
              />
            </div>
          </main>
        </div>
      </>
    );
  }

  // ... keep existing code for legacy reports

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
    // Set new finding as collapsed by default
    setCollapsed((prev) => ({ ...prev, [fid]: true }));
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
    const message = (e as any)?.message || "";
    toast({
      title: "AI analysis failed",
      description: message.includes("API key")
        ? "Add your OpenAI API key in Settings > Integrations."
        : "Please try again.",
      variant: "destructive",
    });
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

  const generateShareLink = async (expiresAt?: Date) => {
    if (!report) return;
    try {
      const token = crypto.randomUUID();
      const { error } = await supabase.from("report_shares").insert({
        report_id: report.id,
        token,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      });
      if (error) throw error;
      setReport((prev) => (prev ? { ...prev, shareToken: token } : prev));
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to generate share link", variant: "destructive" });
    }
  };

  const revokeShareLink = async () => {
    if (!report) return;
    try {
      const { error } = await supabase.from("report_shares").delete().eq("report_id", report.id);
      if (error) throw error;
      setReport((prev) => (prev ? { ...prev, shareToken: undefined } : prev));
      toast({ title: "Share link revoked" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to revoke share link", variant: "destructive" });
    }
  };

  const regenerateShareLink = async (expiresAt?: Date) => {
    await revokeShareLink();
    await generateShareLink(expiresAt);
  };

  const copyShareLink = () => {
    if (!report?.shareToken) return;
    const url = `${SUPABASE_URL}/functions/v1/share-report?token=${report.shareToken}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied" });
  };

  const sendReportEmail = async () => {
    if (!report?.shareToken) {
      toast({ title: "No share link", variant: "destructive" });
      return;
    }
    const link = `${SUPABASE_URL}/functions/v1/share-report?token=${report.shareToken}`;
    const recipients = selectedContacts
      .filter((c) => c.email)
      .map((c) => ({ id: c.id, email: c.email as string, name: `${c.first_name} ${c.last_name}` }));
    if (recipients.length === 0) return;
    setSendingReport(true);
    try {
      const { data, error } = await (supabase as any).functions.invoke(
        "send-report-email",
        {
          body: { reportId: report.id, shareLink: link, recipients },
        }
      );
      if (error || data?.error) throw error ?? new Error(data.error);
      toast({ title: "Report emailed" });
      setEmailDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send email", variant: "destructive" });
    } finally {
      setSendingReport(false);
    }
  };

  const finalize = async () => {
    if (!report) return;
    setReport((prev) => (prev ? { ...prev, status: "Final" } : prev));
    if (user) await generateShareLink();
    toast({ title: "Report finalized. Use Preview to print/PDF." });
  };

  const handleSave = async () => {
    if (!report) return;
    try {
      saveLocalReport(report);
      if (user) {
        await dbUpdateReport(report);
      }
      toast({ title: "Report saved" });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", variant: "destructive" });
    }
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
        <Seo title={`${report.title} | Uniform Mitigation Editor`} />
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

  if (report && report.reportType === "fl_four_point_citizens") {
    return (
      <>
        <Seo title={`${report.title} | FL 4-Point Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <React.Suspense fallback={<div>Loading...</div>}>
            <FlFourPointEditor report={report} onUpdate={setReport} />
          </React.Suspense>
        </div>
      </>
    );
  }

  if (report && report.reportType === "tx_coastal_windstorm_mitigation") {
    return (
      <>
        <Seo title={`${report.title} | TX Windstorm Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <React.Suspense fallback={<div>Loading...</div>}>
            <TxWindstormEditor report={report as any} onUpdate={setReport as any} />
          </React.Suspense>
        </div>
      </>
    );
  }

  if (report && report.reportType === "ca_wildfire_defensible_space") {
    return (
      <>
        <Seo title={`${report.title} | CA Wildfire Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <React.Suspense fallback={<div>Loading...</div>}>
            <CaWildfireEditor report={report as any} onUpdate={setReport as any} />
          </React.Suspense>
        </div>
      </>
    );
  }

  if (report && report.reportType === "roof_certification_nationwide") {
    return (
      <>
        <Seo title={`${report.title} | Roof Certification Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <React.Suspense fallback={<div>Loading...</div>}>
            <RoofCertificationEditor report={report as any} onUpdate={setReport as any} />
          </React.Suspense>
        </div>
      </>
    );
  }
  if (report && report.reportType === "manufactured_home_insurance_prep") {
    return (
      <>
        <Seo title={`${report.title} | Manufactured Home Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <React.Suspense fallback={<div>Loading...</div>}>
            <ManufacturedHomeEditor report={report as any} onUpdate={setReport as any} />
          </React.Suspense>
        </div>
      </>
    );
  }


  if (report && report.reportType !== "home_inspection") {
    return (
      <>
        <Seo title={`${report.title} | Report Editor`} />
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">Editor for {REPORT_TYPE_LABELS[report.reportType]} coming soon.</p>
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
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold truncate">{report.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={() => nav("/reports")}>Back to Reports</Button>
            <Button variant="outline" size="sm" onClick={() => nav(`/reports/${report.id}/preview`)}>Preview</Button>
            <Button size="sm" onClick={handleSave}>Save Report</Button>
          </div>
        </div>
        <div className="md:flex md:flex-nowrap items-start gap-6">
          {/* Mobile Dropdown */}
          <div className="md:hidden mb-4">
            <Select
              value={showDetails ? 'report_details' : activeSection?.id || ''}
              onValueChange={(value) => {
                if (value === 'report_details') {
                  setShowDetails(true);
                } else {
                  setShowDetails(false);
                  setActive(value);
                }
              }}
            >
              <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-md z-50">
                {/* Report Details - Always first */}
                {(() => {
                  const reportDetailsSection = SOP_SECTIONS.find(s => s.key === 'report_details');
                  if (reportDetailsSection) {
                    return (
                      <SelectItem key={reportDetailsSection.key} value="report_details" className="hover:bg-accent">
                        {reportDetailsSection.name}
                      </SelectItem>
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
                    <SelectItem key={s.key} value={sec.id} className="hover:bg-accent">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{s.name}</span>
                        {count > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-[10px]">
                            {count}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
                
                {/* Custom Sections */}
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
                    <SelectItem key={cs.id} value={sec.id} className="hover:bg-accent">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{cs.title}</span>
                        {count > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-[10px]">
                            {count}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-full md:w-64 shrink-0">
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
              <div className="border-b mb-4">
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                value={f.title}
                                onChange={(e) => updateFinding(f.id, { title: e.target.value })}
                                placeholder="Finding title"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCollapsed((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                            >
                              {collapsed[f.id] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          {!collapsed[f.id] && (
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={f.severity}
                                  onValueChange={(value) => updateFinding(f.id, { severity: value as any })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background">
                                    {SEVERITIES.map((s) => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFinding(f.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {!collapsed[f.id] && (
                          <>
                            <div className="mt-3">
                              <Textarea
                                placeholder="Narrative"
                                value={f.narrative || ""}
                                onChange={(e) => updateFinding(f.id, { narrative: e.target.value })}
                                className="min-h-32"
                              />
                            </div>
                            <div className="mt-3">
                              <Textarea
                                placeholder="Recommendation"
                                value={f.recommendation || ""}
                                onChange={(e) => updateFinding(f.id, { recommendation: e.target.value })}
                                className="min-h-28"
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium mb-1">Media</label>
                              <div className="flex flex-wrap gap-3">

                                  {f.media.map((m) => {
                                    const hasSignedUrl = !isSupabaseUrl(m.url) || !!mediaUrlMap[m.id];
                                    const resolvedUrl = hasSignedUrl ? mediaUrlMap[m.id] || m.url : undefined;
                                    return (
                                      <div key={m.id} className="relative w-24 h-24 border rounded overflow-hidden">
                                        {hasSignedUrl ? (
                                          <img
                                            src={resolvedUrl}
                                            alt={m.caption || "Media"}
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={() =>
                                              hasSignedUrl && setZoomImage({ url: resolvedUrl!, caption: m.caption })
                                            }
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-muted" />
                                        )}

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
                                              console.log("ReportEditor - Navigating to annotation:", {
                                                reportId: report.id,
                                                findingId: f.id,
                                                mediaId: m.id,
                                                mediaUrl: m.url,
                                                reportType: report.reportType
                                              });
                                              
                                              // Validate data before navigation
                                              if (!report.id || !f.id || !m.id) {
                                                toast({
                                                  title: "Navigation Error",
                                                  description: "Missing required IDs for annotation",
                                                  variant: "destructive",
                                                });
                                                return;
                                              }
                                              
                                              // Open annotation modal
                                              setAnnotatorImage({
                                                url: mediaUrlMap[m.id] || m.url,
                                                mediaId: m.id,
                                                findingId: f.id
                                              });
                                              setAnnotatorOpen(true);
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
                                            if (!hasSignedUrl) return;
                                            setAiDialogFindingId(f.id);
                                            setAiDialogImages([{ id: m.id, url: resolvedUrl!, caption: m.caption }]);
                                            setAiDialogOpen(true);
                                          }}
                                        >
                                          <Wand2 className="w-4 h-4 text-blue-500" />
                                        </button>
                                      </div>
                                    );
                                  })}

                            
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
              
              {/* Standards of Practice toggle for home inspection reports */}
              {report.reportType === "home_inspection" && (
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <input
                    type="checkbox"
                    id="includeStandardsOfPracticeDetails"
                    checked={(report as any).includeStandardsOfPractice ?? true}
                    onChange={(e) => setReport((prev) => (prev ? ({ ...prev, includeStandardsOfPractice: e.target.checked } as Report) : prev))}
                    className="h-4 w-4"
                  />
                  <label 
                    htmlFor="includeStandardsOfPracticeDetails"
                    className="text-sm font-normal"
                  >
                    Include InterNACHI Standards of Practice in final report
                  </label>
                </div>
              )}
            </section>
          )}

          {activeSection.key === "finalize" && (
            <section className="rounded-md border p-3 space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">Include Standards of Practice</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeStandardsOfPractice"
                    checked={(report as any).includeStandardsOfPractice ?? true}
                    onChange={(e) => setReport((prev) => (prev ? ({ ...prev, includeStandardsOfPractice: e.target.checked } as Report) : prev))}
                    className="h-4 w-4"
                  />
                  <label htmlFor="includeStandardsOfPractice" className="text-sm">
                    Include InterNACHI Standards of Practice in final report
                  </label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium">Additional comments</div>
                <Textarea
                  placeholder="Any final notes..."
                  value={(report as any).finalComments || ""}
                  onChange={(e) => setReport((prev) => (prev ? ({ ...prev, finalComments: e.target.value } as Report) : prev))}
                />
              </div>
              
              <Button onClick={finalize} disabled={report.status === "Final"}>
                {report.status === "Final" ? "Finalized" : "Finalize"}
              </Button>
              {report.status === "Final" && (
                <>
                  <div className="space-y-2">
                    <Label>Share link</Label>
                    {report.shareToken ? (
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`${SUPABASE_URL}/functions/v1/share-report?token=${report.shareToken}`}
                        />
                        <Button type="button" variant="secondary" onClick={copyShareLink}>
                          Copy
                        </Button>
                        <Button type="button" variant="outline" onClick={() => regenerateShareLink()}>
                          Regenerate
                        </Button>
                        <Button type="button" variant="destructive" onClick={revokeShareLink}>
                          Revoke
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" onClick={() => generateShareLink()}>
                        Generate Share Link
                      </Button>
                    )}
                  </div>
                  {report.shareToken && (
                    <Button type="button" variant="secondary" onClick={() => setEmailDialogOpen(true)}>
                      Email Report
                    </Button>
                  )}
                </>
              )}
            </section>
          )}

          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link to calendar?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={openSelectDialog}>Select existing</Button>
                <Button onClick={openCreateDialog}>Create new</Button>
                <Button variant="secondary" onClick={() => { setLinkDialogOpen(false); setLinkDialogDismissed(true); }}>
                  Dismiss
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={selectApptDialogOpen} onOpenChange={setSelectApptDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Appointment</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <Select value={selectedAppointmentId} onValueChange={setSelectedAppointmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an appointment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingAppointments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title} - {new Date(a.appointment_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setSelectApptDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLinkExisting} disabled={!selectedAppointmentId}>
                  Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createApptDialogOpen} onOpenChange={setCreateApptDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newApptTitle}
                  onChange={(e) => setNewApptTitle(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  value={newApptDate}
                  onChange={(e) => setNewApptDate(e.target.value)}
                />
                <Input
                  placeholder="Address"
                  value={newApptAddress}
                  onChange={(e) => setNewApptAddress(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setCreateApptDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAppointment} disabled={!newApptTitle || !newApptDate}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select recipients</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <ContactMultiSelect
                  contacts={recipientOptions}
                  value={selectedRecipients}
                  onChange={setSelectedRecipients}
                  onSelectedContactsChange={setSelectedContacts}
                />
              </div>
              <DialogFooter>
                <Button onClick={sendReportEmail} disabled={sendingReport || selectedContacts.length === 0}>
                  {sendingReport ? "Sending..." : "Send"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
              // Set new finding as collapsed by default
              setCollapsed((prev) => ({ ...prev, [fid]: true }));
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

          <KonvaAnnotator
            isOpen={annotatorOpen}
            onClose={() => {
              setAnnotatorOpen(false);
              setAnnotatorImage(null);
            }}
            imageUrl={annotatorImage?.url || ""}
            initialAnnotations={
              annotatorImage
                ? activeSection?.findings
                    .find((f) => f.id === annotatorImage.findingId)?.media
                    .find((m) => m.id === annotatorImage.mediaId)?.annotations || ""
                : ""
            }
            onSave={handleAnnotationSave}
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
      </div>
    </>
  );
};

export default ReportEditor;
