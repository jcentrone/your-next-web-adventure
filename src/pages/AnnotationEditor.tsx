import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X } from "lucide-react";
import { CustomAnnotator } from "@/components/annotation/CustomAnnotator";
import { toast } from "sonner";

const AnnotationEditor: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data passed from the report editor
  const { imageUrl, initialAnnotations, findingId, mediaIndex } = location.state || {};
  
  useEffect(() => {
    if (!imageUrl || !reportId) {
      toast.error("Missing required data for annotation");
      navigate("/reports/" + reportId);
      return;
    }
  }, [imageUrl, reportId, navigate]);

  const handleSave = (annotations: string, imageBlob: Blob) => {
    // Pass the annotations back to the report editor
    navigate("/reports/" + reportId, {
      state: {
        annotations,
        imageBlob,
        findingId,
        mediaIndex,
        action: 'saveAnnotations'
      }
    });
    toast.success("Annotations saved successfully");
  };

  const handleCancel = () => {
    navigate("/reports/" + reportId);
  };

  if (!imageUrl || !reportId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-1 sm:gap-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Report</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold truncate">Image Annotation</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Add annotations, arrows, and text to highlight important details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="outline" onClick={handleCancel} size="sm" className="gap-1">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Annotation Area */}
      <div className="flex-1 overflow-hidden">
        <CustomAnnotator
          imageUrl={imageUrl}
          initialAnnotations={initialAnnotations}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AnnotationEditor;