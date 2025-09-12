import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface ResponsiveAnnotationHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
  hasAnnotations?: boolean;
  isModified?: boolean;
}

export const ResponsiveAnnotationHeader: React.FC<ResponsiveAnnotationHeaderProps> = ({
  onCancel,
  onSave,
  isSaving,
  canSave,
  hasAnnotations = false,
  isModified = false
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold">Annotate</h1>
              <div className="flex items-center gap-1">
                {hasAnnotations && (
                  <Badge variant="secondary" className="text-xs">
                    Has annotations
                  </Badge>
                )}
                {isModified && (
                  <Badge variant="outline" className="text-xs">
                    Modified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={onSave}
              disabled={!canSave || isSaving}
              size="sm"
              className="gap-1"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              <span className="hidden xs:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Report
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Annotate Image</h1>
            {hasAnnotations && (
              <Badge variant="secondary">
                Has annotations
              </Badge>
            )}
            {isModified && (
              <Badge variant="outline">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!canSave || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Annotations
          </Button>
        </div>
      </div>
    </div>
  );
};