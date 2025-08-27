
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isSupabaseUrl } from "@/integrations/supabase/storage";

type ImageOption = { id: string; url: string; caption?: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ImageOption[];
  loading?: boolean;
  onConfirm: (imageId: string) => void;
}

const AIAnalyzeDialog: React.FC<Props> = ({ open, onOpenChange, images, loading, onConfirm }) => {
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelected(images[0]?.id ?? null);
    }
  }, [open, images]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select image for AI analysis</DialogTitle>
        </DialogHeader>
        {images.length === 0 ? (
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
