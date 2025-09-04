import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";
import { RotateCcw, Save, Upload, Trash2 } from "lucide-react";

const SIGNATURE_FONTS = [
  { id: "dancing", name: "Dancing Script", className: "font-dancing" },
  { id: "great", name: "Great Vibes", className: "font-great" },
  { id: "allura", name: "Allura", className: "font-allura" },
  { id: "sacramento", name: "Sacramento", className: "font-sacramento" },
];

export interface SignaturePadHandle {
  clear: () => void;
  toDataURL: () => string | undefined;
}

interface SignaturePadProps {
  currentSignature?: string;
  currentSignatureType?: string;
  fullName?: string;
  onChange: (dataUrl: string, type: string) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const SignaturePad = React.forwardRef<SignaturePadHandle, SignaturePadProps>(
  (
    {
      currentSignature,
      currentSignatureType,
      fullName = "",
      onChange,
      onDelete,
      isLoading = false,
    },
    ref
  ) => {
    const [signature, setSignature] = useState<string | undefined>(currentSignature);
    const [signatureType, setSignatureType] = useState<string | undefined>(currentSignatureType);
    const [tab, setTab] = useState("draw");

    // Draw
    const canvasRef = useRef<SignatureCanvas | null>(null);

    const applyDraw = () => {
      if (!canvasRef.current || canvasRef.current.isEmpty()) {
        toast({
          title: "No signature",
          description: "Please draw your signature before saving.",
          variant: "destructive",
        });
        return;
      }
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setSignature(dataUrl);
      setSignatureType("drawn");
      onChange(dataUrl, "drawn");
    };

    const clearDraw = () => {
      canvasRef.current?.clear();
    };

    useImperativeHandle(ref, () => ({
      clear: () => clearDraw(),
      toDataURL: () => canvasRef.current?.toDataURL("image/png"),
    }));

    // Type
    const [typedName, setTypedName] = useState(fullName);
    const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].id);
    const typedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const generateTypedSignature = useCallback(() => {
      const canvas = typedCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 120;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const font =
        SIGNATURE_FONTS.find((f) => f.id === selectedFont)?.name || SIGNATURE_FONTS[0].name;

      void document.fonts.load(`48px "${font}"`).then(() => {
        ctx.font = `48px "${font}", cursive`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);
      });
    }, [typedName, selectedFont]);

    useEffect(() => {
      generateTypedSignature();
    }, [generateTypedSignature]);

    const applyTyped = () => {
      if (!typedName.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your name to create a signature.",
          variant: "destructive",
        });
        return;
      }
      if (!typedCanvasRef.current) return;
      const dataUrl = typedCanvasRef.current.toDataURL("image/png");
      setSignature(dataUrl);
      setSignatureType("typed");
      onChange(dataUrl, "typed");
    };

    // Upload
    const handleFile = (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image file (PNG, JPG, SVG).",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSignature(dataUrl);
        setSignatureType("uploaded");
        onChange(dataUrl, "uploaded");
      };
      reader.readAsDataURL(file);
    };

    const onDrop = useCallback((accepted: File[]) => {
      const file = accepted[0];
      if (file) handleFile(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: false,
      accept: { "image/*": [] },
      maxSize: 2 * 1024 * 1024,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    };

    const handleRemove = () => {
      setSignature(undefined);
      setSignatureType(undefined);
      onDelete();
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Digital Signature</h3>
          {signature && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
          {signature ? (
            <img
              src={signature}
              alt="Current signature"
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No signature set</p>
          )}
        </div>
        {signature && (
          <p className="text-sm text-muted-foreground text-center">
            Current signature ({signatureType || "unknown"})
          </p>
        )}

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-2">
            <div className="flex items-center justify-center border border-border rounded-lg bg-background">
              <SignatureCanvas
                ref={canvasRef}
                canvasProps={{
                  width: 400,
                  height: 200,
                  className: "border-none bg-white",
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={clearDraw}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button type="button" onClick={applyDraw}>
                <Save className="h-4 w-4 mr-2" />
                Use
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typed-name">Full Name</Label>
              <Input
                id="typed-name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
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
                      style={{ fontFamily: `"${font.name}", cursive`, fontSize: "18px" }}
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
                  ref={typedCanvasRef}
                  className="max-w-full h-auto"
                  style={{ maxHeight: "120px" }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={applyTyped} disabled={!typedName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Use
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-2">
            <div
              {...getRootProps({
                className:
                  "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer text-center bg-background",
              })}
            >
              <input {...getInputProps({ onChange: handleInputChange })} />
              <Upload className="h-8 w-8 mb-2" />
              {isDragActive ? (
                <p>Drop the image here...</p>
              ) : (
                <p>Drag and drop an image here, or click to browse</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
