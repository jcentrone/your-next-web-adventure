import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SignatureTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  defaultName?: string;
}

const SIGNATURE_FONTS = [
  { id: 'dancing', name: 'Dancing Script', className: 'font-dancing' },
  { id: 'great', name: 'Great Vibes', className: 'font-great' },
  { id: 'allura', name: 'Allura', className: 'font-allura' },
  { id: 'sacramento', name: 'Sacramento', className: 'font-sacramento' },
];

const SignatureTypeDialog: React.FC<SignatureTypeDialogProps> = ({
  open,
  onClose,
  onSave,
  defaultName = "",
}) => {
  const [signatureName, setSignatureName] = React.useState(defaultName);
  const [selectedFont, setSelectedFont] = React.useState(SIGNATURE_FONTS[0].id);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    setSignatureName(defaultName);
  }, [defaultName]);

  const generateSignature = React.useCallback(() => {
    if (!canvasRef.current || !signatureName.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 120;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font properties
    const selectedFontData = SIGNATURE_FONTS.find(f => f.id === selectedFont);
    const fontFamily = selectedFontData?.name || 'Dancing Script';
    
    ctx.font = `48px "${fontFamily}", cursive`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw signature text
    ctx.fillText(signatureName.trim(), canvas.width / 2, canvas.height / 2);
  }, [signatureName, selectedFont]);

  React.useEffect(() => {
    if (open) {
      // Small delay to ensure canvas is rendered
      setTimeout(generateSignature, 100);
    }
  }, [open, generateSignature]);

  React.useEffect(() => {
    generateSignature();
  }, [generateSignature]);

  const handleSave = () => {
    if (!signatureName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a signature.",
        variant: "destructive",
      });
      return;
    }

    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  const selectedFontData = SIGNATURE_FONTS.find(f => f.id === selectedFont);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Typed Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature-name">Full Name</Label>
            <Input
              id="signature-name"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-3">
            <Label>Font Style</Label>
            <RadioGroup value={selectedFont} onValueChange={setSelectedFont}>
              {SIGNATURE_FONTS.map((font) => (
                <div key={font.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={font.id} id={font.id} />
                  <Label 
                    htmlFor={font.id} 
                    className="cursor-pointer flex-1"
                    style={{ fontFamily: `"${font.name}", cursive`, fontSize: '18px' }}
                  >
                    {font.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-background">
              <canvas 
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ maxHeight: '120px' }}
              />
            </div>
          </div>

          <Separator />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!signatureName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureTypeDialog;