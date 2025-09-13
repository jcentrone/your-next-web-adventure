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
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Report
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Image Annotation</h1>
              <p className="text-sm text-muted-foreground">
                Add annotations, arrows, and text to highlight important details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
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