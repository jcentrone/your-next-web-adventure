import React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface SignatureUploadFieldProps {
  onSignatureUpload: (file: File) => void;
  currentSignature?: string;
  isUploading?: boolean;
}

const SignatureUploadField: React.FC<SignatureUploadFieldProps> = ({
  onSignatureUpload,
  currentSignature,
  isUploading = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (PNG, JPG, SVG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    onSignatureUpload(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Upload Signature Image</Label>
      
      {currentSignature && (
        <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
          <img 
            src={currentSignature} 
            alt="Current signature" 
            className="max-h-16 max-w-full object-contain"
          />
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleUploadClick}
        disabled={isUploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : currentSignature ? "Replace Signature" : "Upload Signature"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Supported formats: PNG, JPG, SVG. Max size: 2MB.
      </p>
    </div>
  );
};

export default SignatureUploadField;