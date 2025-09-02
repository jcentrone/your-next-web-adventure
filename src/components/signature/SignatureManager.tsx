import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    setIsUploading(true);
    try {
      // Create data URL from file
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onSignatureUpdate(dataUrl, 'uploaded');
        toast({
          title: "Signature uploaded",
          description: "Your signature has been saved successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
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

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="draw">
              <PenTool className="h-4 w-4 mr-2" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type">
              <Type className="h-4 w-4 mr-2" />
              Type
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <SignatureUploadField
              currentSignature={currentSignature}
              onSignatureUpload={handleFileUpload}
              isUploading={isUploading || isLoading}
            />
          </TabsContent>

          <TabsContent value="draw" className="space-y-4">
            <Button
              onClick={() => setShowDrawDialog(true)}
              disabled={isLoading}
              className="w-full"
            >
              <PenTool className="h-4 w-4 mr-2" />
              {currentSignature ? "Replace with Drawing" : "Draw Signature"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Use your finger, stylus, or mouse to draw your signature.
            </p>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <Button
              onClick={() => setShowTypeDialog(true)}
              disabled={isLoading}
              className="w-full"
            >
              <Type className="h-4 w-4 mr-2" />
              {currentSignature ? "Replace with Typed" : "Create Typed Signature"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Generate a signature from your name using cursive fonts.
            </p>
          </TabsContent>
        </Tabs>

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