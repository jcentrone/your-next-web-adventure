import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/integrations/supabase/reportsApi";
import { getSignedUrlFromSupabaseUrl, isSupabaseUrl } from "@/integrations/supabase/storage";
import { useAnnotationCanvas } from "@/hooks/useAnnotationCanvas";
import { ResponsiveAnnotationHeader } from "@/components/annotation/ResponsiveAnnotationHeader";
import { AnnotationToolbar } from "@/components/annotation/AnnotationToolbar";
import { AnnotationErrorBoundary } from "@/components/annotation/AnnotationErrorBoundary";

export default function ImageAnnotation() {
  const { reportId, findingId, mediaId } = useParams<{ 
    reportId: string; 
    findingId: string; 
    mediaId: string; 
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch report data
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportsApi.dbGetReport(reportId!),
    enabled: !!reportId,
  });

  // Find the specific media item with improved error handling for all report types
  const mediaItem = useMemo(() => {
    console.log("ImageAnnotation - Finding media item:", {
      reportId,
      findingId,
      mediaId,
      reportType: report?.reportType,
      hasReport: !!report
    });
    
    if (!report || !findingId || !mediaId) {
      console.log("ImageAnnotation - Missing required data");
      return null;
    }
    
    // Handle home inspection reports
    if (report.reportType === "home_inspection") {
      const homeReport = report as any;
      for (const section of homeReport.sections || []) {
        const finding = section.findings?.find((f: any) => f.id === findingId);
        if (finding) {
          const media = finding.media?.find((m: any) => m.id === mediaId);
          if (media) {
            console.log("ImageAnnotation - Found media item (home_inspection):", media);
            return media;
          }
        }
      }
    }
    
    // Handle specialized reports (wind-mitigation, fl-four-point, etc.)
    const reportData = (report as any).data;
    if (reportData?.sections) {
      for (const section of reportData.sections) {
        if (section.findings) {
          const finding = section.findings.find((f: any) => f.id === findingId);
          if (finding) {
            const media = finding.media?.find((m: any) => m.id === mediaId);
            if (media) {
              console.log("ImageAnnotation - Found media item (specialized):", media);
              return media;
            }
          }
        }
      }
    }
    
    // Handle direct findings array (some report structures)
    if (reportData?.findings) {
      const finding = reportData.findings.find((f: any) => f.id === findingId);
      if (finding) {
        const media = finding.media?.find((m: any) => m.id === mediaId);
        if (media) {
          console.log("ImageAnnotation - Found media item (direct findings):", media);
          return media;
        }
      }
    }
    
    console.warn("ImageAnnotation - Media item not found. Report structure:", {
      reportType: report.reportType,
      hasData: !!reportData,
      dataKeys: reportData ? Object.keys(reportData) : [],
      hasSections: !!(reportData?.sections || (report as any).sections),
      sectionsCount: (reportData?.sections || (report as any).sections || []).length
    });
    
    return null;
  }, [report, findingId, mediaId, reportId]);

  // Get signed URL for the image
  const [imageUrl, setImageUrl] = useState<string>("");
  
  useEffect(() => {
    if (!mediaItem?.url) return;
    
    const getImageUrl = async () => {
      try {
        if (isSupabaseUrl(mediaItem.url)) {
          const signedUrl = await getSignedUrlFromSupabaseUrl(mediaItem.url);
          setImageUrl(signedUrl);
        } else {
          setImageUrl(mediaItem.url);
        }
      } catch (error) {
        console.error("Error getting signed URL:", error);
        toast.error("Failed to load image");
      }
    };
    
    getImageUrl();
  }, [mediaItem?.url]);

  // Use the custom canvas hook
  const canvas = useAnnotationCanvas({
    imageUrl,
    existingAnnotations: mediaItem?.annotations,
  });

  const handleSave = async () => {
    if (!canvas.canvasReady || !report || !findingId || !mediaId) {
      toast.error("Cannot save: missing required data");
      return;
    }

    setIsSaving(true);
    try {
      const annotationData = canvas.getAnnotationsJson();
      if (!annotationData) {
        toast.error("Failed to get annotation data");
        return;
      }

      // Update the media item for all report types
      const updatedReport = { ...report };
      let mediaUpdated = false;
      
      // Handle home inspection reports
      if (updatedReport.reportType === "home_inspection") {
        const homeReport = updatedReport as any;
        for (const section of homeReport.sections || []) {
          const finding = section.findings?.find((f: any) => f.id === findingId);
          if (finding) {
            const media = finding.media?.find((m: any) => m.id === mediaId);
            if (media) {
              media.annotations = annotationData.json;
              media.isAnnotated = annotationData.hasAnnotations;
              mediaUpdated = true;
              break;
            }
          }
        }
      }
      
      // Handle specialized reports (wind-mitigation, fl-four-point, etc.)
      if (!mediaUpdated) {
        const reportData = (updatedReport as any).data;
        if (reportData?.sections) {
          for (const section of reportData.sections) {
            if (section.findings) {
              const finding = section.findings.find((f: any) => f.id === findingId);
              if (finding) {
                const media = finding.media?.find((m: any) => m.id === mediaId);
                if (media) {
                  media.annotations = annotationData.json;
                  media.isAnnotated = annotationData.hasAnnotations;
                  mediaUpdated = true;
                  break;
                }
              }
            }
          }
        }
        
        // Handle direct findings array
        if (!mediaUpdated && reportData?.findings) {
          const finding = reportData.findings.find((f: any) => f.id === findingId);
          if (finding) {
            const media = finding.media?.find((m: any) => m.id === mediaId);
            if (media) {
              media.annotations = annotationData.json;
              media.isAnnotated = annotationData.hasAnnotations;
              mediaUpdated = true;
            }
          }
        }
      }
      
      if (!mediaUpdated) {
        throw new Error("Could not find media item to update");
      }

      await reportsApi.dbUpdateReport(updatedReport);
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      
      canvas.resetUnsavedChanges();
      toast.success("Annotations saved successfully!");
      navigate(`/reports/${reportId}`);
      
    } catch (error) {
      console.error("Failed to save annotations:", error);
      toast.error("Failed to save annotations");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/reports/${reportId}`);
  };

  if (!reportId || !findingId || !mediaId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Invalid annotation parameters</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (reportLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!mediaItem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Media item not found</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Report ID: {reportId}</p>
                <p>Finding ID: {findingId}</p>
                <p>Media ID: {mediaId}</p>
                <p>Report Type: {report?.reportType || 'Unknown'}</p>
                <p>Sections: {report?.reportType === "home_inspection" ? (report as any).sections?.length || 0 : 0}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasAnnotations = mediaItem?.annotations && mediaItem.annotations !== '{}';

  return (
    <AnnotationErrorBoundary onNavigateHome={() => navigate(`/reports/${reportId}`)}>
      <div className="min-h-screen bg-background">
        <ResponsiveAnnotationHeader
          onCancel={handleCancel}
          onSave={handleSave}
          isSaving={isSaving}
          canSave={canvas.canvasReady}
          hasAnnotations={hasAnnotations}
          isModified={canvas.hasUnsavedChanges}
        />

        <AnnotationToolbar
          activeTool={canvas.activeTool}
          activeColor={canvas.activeColor}
          onToolClick={canvas.handleToolClick}
          onColorChange={canvas.setActiveColor}
          onUndo={canvas.undo}
          onRedo={canvas.redo}
          canUndo={canvas.canUndo}
          canRedo={canvas.canRedo}
          disabled={!canvas.canvasReady}
        />

        <div className="p-4">
          {canvas.error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{canvas.error}</AlertDescription>
            </Alert>
          )}

          <div className="relative flex justify-center">
            {canvas.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              </div>
            )}
            
            <div className="border rounded-lg shadow-lg overflow-hidden bg-white">
              <canvas ref={canvas.canvasRef} className="max-w-full touch-none" />
            </div>
          </div>
        </div>
      </div>
    </AnnotationErrorBoundary>
  );
}