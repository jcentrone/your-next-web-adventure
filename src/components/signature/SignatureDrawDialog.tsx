import React from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SignatureDrawDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

const SignatureDrawDialog: React.FC<SignatureDrawDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = React.useState<FabricCanvas | null>(null);
  const [hasSignature, setHasSignature] = React.useState(false);

  React.useEffect(() => {
    if (!canvasRef.current || !open) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 200,
      backgroundColor: "#ffffff",
      isDrawingMode: true,
    });

    // Configure drawing brush
    canvas.freeDrawingBrush.color = "#000000";
    canvas.freeDrawingBrush.width = 2;

    // Track drawing activity
    canvas.on('path:created', () => {
      setHasSignature(true);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, [open]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!fabricCanvas || !hasSignature) {
      toast({
        title: "No signature",
        description: "Please draw your signature before saving.",
        variant: "destructive",
      });
      return;
    }

    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution
    });

    onSave(dataUrl);
    onClose();
    handleClear();
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center border border-border rounded-lg bg-background">
            <canvas 
              ref={canvasRef}
              className="border-none cursor-crosshair touch-none"
              style={{ touchAction: 'none' }}
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Draw your signature in the area above using your finger, stylus, or mouse.
          </p>

          <Separator />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClear}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button type="button" onClick={handleSave} disabled={!hasSignature}>
              <Save className="h-4 w-4 mr-2" />
              Save Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureDrawDialog;