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
import { uploadSignatureFromDataUrl } from "@/integrations/supabase/organizationsApi";

const INITIALS_FONTS = [
  { id: "dancing", name: "Dancing Script", className: "font-dancing" },
  { id: "great", name: "Great Vibes", className: "font-great" },
  { id: "allura", name: "Allura", className: "font-allura" },
  { id: "sacramento", name: "Sacramento", className: "font-sacramento" },
];

export interface InitialsPadHandle {
  clear: () => void;
  toDataURL: () => string | undefined;
}

interface InitialsPadProps {
  currentInitials?: string;
  currentInitialsType?: string;
  fullName?: string;
  onSave: (initialsUrl: string, type: string) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const InitialsPad = React.forwardRef<InitialsPadHandle, InitialsPadProps>(
  (
    {
      currentInitials,
      currentInitialsType,
      fullName = "",
      onSave,
      onDelete,
      isLoading = false,
    },
    ref
  ) => {
    const [initials, setInitials] = useState<string | undefined>(currentInitials);
    const [initialsType, setInitialsType] = useState<string | undefined>(currentInitialsType);
    const [tab, setTab] = useState("draw");
    const [uploadedImage, setUploadedImage] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      setInitials(currentInitials);
      setInitialsType(currentInitialsType);
    }, [currentInitials, currentInitialsType]);

    // Draw
    const canvasRef = useRef<SignatureCanvas | null>(null);
    const clearDraw = () => {
      canvasRef.current?.clear();
    };

    useImperativeHandle(ref, () => ({
      clear: () => clearDraw(),
      toDataURL: () => canvasRef.current?.toDataURL("image/png"),
    }));

    // Type - Generate initials from full name
    const getInitialsFromName = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3); // Max 3 initials
    };

    const [typedInitials, setTypedInitials] = useState(getInitialsFromName(fullName));
    const [selectedFont, setSelectedFont] = useState(INITIALS_FONTS[0].id);
    const typedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const generateTypedInitials = useCallback(() => {
      const canvas = typedCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 200;
      canvas.height = 100;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const font =
        INITIALS_FONTS.find((f) => f.id === selectedFont)?.name || INITIALS_FONTS[0].name;

      void document.fonts.load(`36px "${font}"`).then(() => {
        ctx.font = `36px "${font}", cursive`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedInitials.trim(), canvas.width / 2, canvas.height / 2);
      });
    }, [typedInitials, selectedFont]);

    useEffect(() => {
      generateTypedInitials();
    }, [generateTypedInitials]);

    // Update initials when name changes
    useEffect(() => {
      if (fullName) {
        setTypedInitials(getInitialsFromName(fullName));
      }
    }, [fullName]);

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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL("image/png");
          setUploadedImage(pngDataUrl);
        };
        img.src = e.target?.result as string;
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
      setInitials(undefined);
      setInitialsType(undefined);
      setUploadedImage(undefined);
      onDelete();
    };

    const handleSave = async () => {
      let dataUrl: string | undefined;
      let type: string | undefined;

      if (tab === "draw") {
        if (!canvasRef.current || canvasRef.current.isEmpty()) {
          toast({
            title: "No initials",
            description: "Please draw your initials before saving.",
            variant: "destructive",
          });
          return;
        }
        dataUrl = canvasRef.current.toDataURL("image/png");
        type = "drawn";
      } else if (tab === "type") {
        if (!typedInitials.trim()) {
          toast({
            title: "Initials required",
            description: "Please enter your initials.",
            variant: "destructive",
          });
          return;
        }
        if (!typedCanvasRef.current) return;
        dataUrl = typedCanvasRef.current.toDataURL("image/png");
        type = "typed";
      } else if (tab === "upload") {
        if (!uploadedImage) {
          toast({
            title: "No image uploaded",
            description: "Please upload an image before saving.",
            variant: "destructive",
          });
          return;
        }
        dataUrl = uploadedImage;
        type = "uploaded";
      }

      if (!dataUrl || !type) return;

      try {
        setIsSaving(true);
        const url = await uploadSignatureFromDataUrl(dataUrl, type);
        setInitials(url);
        setInitialsType(type);
        onSave(url, type);
        toast({ title: "Initials saved" });
      } catch (error) {
        toast({
          title: "Failed to save initials",
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Digital Initials</h3>
          {initials && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isLoading || isSaving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
          {initials ? (
            <img
              src={initials}
              alt="Current initials"
              className="max-h-16 max-w-full object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No initials set</p>
          )}
        </div>
        {initials && (
          <p className="text-sm text-muted-foreground text-center">
            Current initials ({initialsType || "unknown"})
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
                  width: 300,
                  height: 150,
                  className: "border-none bg-white",
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={clearDraw}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typed-initials">Initials</Label>
              <Input
                id="typed-initials"
                value={typedInitials}
                onChange={(e) => setTypedInitials(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="Enter your initials (e.g., JD)"
                maxLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Maximum 3 characters
              </p>
            </div>

            <div className="space-y-3">
              <Label>Font Style</Label>
              <RadioGroup value={selectedFont} onValueChange={setSelectedFont}>
                {INITIALS_FONTS.map((font) => (
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
                  style={{ maxHeight: "100px" }}
                />
              </div>
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
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Upload preview"
                  className="max-h-32 object-contain"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-2" />
                  {isDragActive ? (
                    <p>Drop the image here...</p>
                  ) : (
                    <p>Drag and drop an image here, or click to browse</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isSaving || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Initials
          </Button>
        </div>
      </div>
    );
  }
);

InitialsPad.displayName = "InitialsPad";

export default InitialsPad;