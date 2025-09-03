import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, PenTool, Type, Trash2 } from "lucide-react";
import SignatureUploadField from "./SignatureUploadField";
import SignatureDrawDialog from "./SignatureDrawDialog";
import SignatureTypeDialog from "./SignatureTypeDialog";
import { toast } from "@/components/ui/use-toast";

interface SignatureManagerProps {
  currentSignature?: string;
  currentSignatureType?: string;
  fullName?: string;
  onSignatureUpdate: (signatureUrl: string, signatureType: string) => void;
  onSignatureDelete: () => void;
  isLoading?: boolean;
}

const SignatureManager: React.FC<SignatureManagerProps> = ({
  currentSignature,
  currentSignatureType,
  fullName,
  onSignatureUpdate,
  onSignatureDelete,
  isLoading = false,
}) => {
  const [showDrawDialog, setShowDrawDialog] = React.useState(false);
  const [showTypeDialog, setShowTypeDialog] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileUpload = async (file: File) => {
    console.log('Starting file upload:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    setIsUploading(true);
    try {
      // Create data URL from file
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        console.log('File converted to data URL, length:', dataUrl?.length);
        onSignatureUpdate(dataUrl, 'uploaded');
        toast({
          title: "Signature uploaded",
          description: "Your signature has been saved successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload signature. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrawSave = (signatureDataUrl: string) => {
    onSignatureUpdate(signatureDataUrl, 'drawn');
    toast({
      title: "Signature saved",
      description: "Your drawn signature has been saved successfully.",
    });
  };

  const handleTypeSave = (signatureDataUrl: string) => {
    onSignatureUpdate(signatureDataUrl, 'typed');
    toast({
      title: "Signature created",
      description: "Your typed signature has been saved successfully.",
    });
  };

  const handleDelete = () => {
    onSignatureDelete();
    toast({
      title: "Signature deleted",
      description: "Your signature has been removed.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Digital Signature
          {currentSignature && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSignature ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
              <img 
                src={currentSignature} 
                alt="Current signature" 
                className="max-h-20 max-w-full object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Current signature ({currentSignatureType || 'unknown'})
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No signature set. Choose a method below to create your signature.
          </p>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Choose a signature method:</h3>
          
          <div className="grid gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDrawDialog(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-12"
            >
              <PenTool className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Draw Signature</div>
                <div className="text-xs text-muted-foreground">Use your finger, stylus, or mouse</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowTypeDialog(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-12"
            >
              <Type className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Type Signature</div>
                <div className="text-xs text-muted-foreground">Generate from your name</div>
              </div>
            </Button>

            <div className="relative">
              <SignatureUploadField
                currentSignature={currentSignature}
                onSignatureUpload={handleFileUpload}
                isUploading={isUploading || isLoading}
              />
            </div>
          </div>
        </div>

        <SignatureDrawDialog
          open={showDrawDialog}
          onClose={() => setShowDrawDialog(false)}
          onSave={handleDrawSave}
        />

        <SignatureTypeDialog
          open={showTypeDialog}
          onClose={() => setShowTypeDialog(false)}
          onSave={handleTypeSave}
          defaultName={fullName}
        />
      </CardContent>
    </Card>
  );
};

export default SignatureManager;