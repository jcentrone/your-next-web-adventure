
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { isSupabaseUrl } from "@/integrations/supabase/storage";

type ImageOption = { id: string; url: string; caption?: string };

interface AnalysisResult {
  title?: string;
  observation?: string;
  implications?: string;
  severity?: string;
  recommendation?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ImageOption[];
  loading?: boolean;
  onConfirm: (imageId: string) => void;
  onApprove?: (result: AnalysisResult) => void;
  analysisResult?: AnalysisResult | null;
}

const AIAnalyzeDialog: React.FC<Props> = ({ 
  open, 
  onOpenChange, 
  images, 
  loading, 
  onConfirm, 
  onApprove,
  analysisResult 
}) => {
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelected(images[0]?.id ?? null);
    }
  }, [open, images]);

  const handleApprove = () => {
    if (analysisResult && onApprove) {
      onApprove(analysisResult);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (onApprove) {
      onApprove(null); // Clear results to go back to image selection
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {analysisResult ? "AI Analysis Results" : "Select image for AI analysis"}
          </DialogTitle>
        </DialogHeader>
        
        {analysisResult ? (
          // Show analysis results
          <div className="space-y-4">
            {analysisResult.title && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Title</h4>
                <p className="text-base">{analysisResult.title}</p>
              </div>
            )}
            
            {analysisResult.severity && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Severity</h4>
                <Badge variant={analysisResult.severity.toLowerCase() === 'major' ? 'destructive' : 'secondary'}>
                  {analysisResult.severity}
                </Badge>
              </div>
            )}

            {analysisResult.observation && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Observation</h4>
                <p className="text-sm whitespace-pre-wrap">{analysisResult.observation}</p>
              </div>
            )}

            {analysisResult.implications && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Implications</h4>
                <p className="text-sm whitespace-pre-wrap">{analysisResult.implications}</p>
              </div>
            )}

            {analysisResult.recommendation && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Recommendation</h4>
                <p className="text-sm whitespace-pre-wrap">{analysisResult.recommendation}</p>
              </div>
            )}

            <Separator />
            
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={handleBack}>
                Back to Images
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove}>
                Apply to Defect
              </Button>
            </div>
          </div>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">Attach a photo to this observation first.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img) => {
                const hasUrl = !isSupabaseUrl(img.url);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelected(img.id)}
                    className={[
                      "relative rounded border p-2 focus:outline-none",
                      selected === img.id ? "ring-2 ring-primary" : "",
                    ].join(" ")}
                  >
                    {hasUrl ? (
                      <img
                        src={img.url}
                        alt={img.caption || "inspection image"}
                        className="w-full h-28 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-28 bg-muted rounded" />
                    )}
                    <div className="mt-1 text-xs text-muted-foreground truncate">{img.caption}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={() => selected && onConfirm(selected)} disabled={!selected || loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalyzeDialog;
