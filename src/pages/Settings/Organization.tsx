import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Seo from "@/components/Seo";
import {
  createOrganization,
  getMyOrganization,
  updateOrganization,
  type Organization,
} from "@/integrations/supabase/organizationsApi";
import { Building2, Camera, Upload, Settings, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type FileRejection, useDropzone } from "react-dropzone";

const OrganizationSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [orgName, setOrgName] = React.useState("");
  const [orgEmail, setOrgEmail] = React.useState("");
  const [orgPhone, setOrgPhone] = React.useState("");
  const [orgAddress, setOrgAddress] = React.useState("");
  const [orgWebsite, setOrgWebsite] = React.useState("");
  const [orgLicense, setOrgLicense] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [showOrganizationError, setShowOrganizationError] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const {
    data: organization,
    isLoading: organizationLoading,
    error: organizationError,
  } = useQuery<Organization | null>({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user,
    retry: false,
  });

  React.useEffect(() => {
    setOrgName(organization?.name || "");
    setOrgEmail(organization?.email || "");
    setOrgPhone(organization?.phone || "");
    setOrgAddress(organization?.address || "");
    setOrgWebsite(organization?.website || "");
    setOrgLicense(organization?.license_number || "");
    setLogoPreview(organization?.logo_url || null);
  }, [organization]);

  React.useEffect(() => {
    if (organizationError) {
      setShowOrganizationError(true);
    }
  }, [organizationError]);

  const updateOrganizationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateOrganization(id, data),
    onSuccess: () => {
      toast({ title: "Organization updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["my-organization"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update organization", description: error.message });
    },
  });

  const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
  const MIN_LOGO_DIMENSION = 200;

  const getStoragePathFromPublicUrl = (url: string): string | null => {
    try {
      const { pathname } = new URL(url);
      const parts = pathname.split("/");
      const publicIndex = parts.indexOf("public");
      if (publicIndex === -1) return null;
      return parts.slice(publicIndex + 2).join("/");
    } catch {
      return null;
    }
  };

  const onDropAccepted = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const dimensionsValid = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const valid = img.width >= MIN_LOGO_DIMENSION && img.height >= MIN_LOGO_DIMENSION;
        URL.revokeObjectURL(img.src);
        resolve(valid);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });

    if (!dimensionsValid) {
      toast({
        title: "Invalid image dimensions",
        description: `Logo must be at least ${MIN_LOGO_DIMENSION}x${MIN_LOGO_DIMENSION}px`,
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, [toast]);

  const onDropRejected = React.useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        if (error.code === "file-too-large") {
          toast({
            title: "File too large",
            description: "Logo must be less than 5MB",
            variant: "destructive",
          });
        } else if (error.code === "file-invalid-type") {
          toast({
            title: "Invalid file type",
            description: "Only PNG or JPG images are allowed",
            variant: "destructive",
          });
        } else {
          toast({ title: "File rejected", description: error.message, variant: "destructive" });
        }
      });
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: { "image/png": [], "image/jpeg": [] },
    maxSize: MAX_LOGO_SIZE,
    multiple: false,
  });

  const handleRemoveLogo = async () => {
    if (logoFile) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (!organization || !organization.logo_url) return;
    const path = getStoragePathFromPublicUrl(organization.logo_url);
    try {
      if (path) {
        const { error } = await supabase.storage.from("report-media").remove([path]);
        if (error) throw error;
      }
      await updateOrganization(organization.id, { logo_url: null });
      setLogoPreview(null);
      toast({ title: "Logo removed" });
      queryClient.invalidateQueries({ queryKey: ["my-organization"] });
    } catch (error) {
      toast({ title: "Failed to remove logo", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleSaveOrganization = async () => {
    try {
      let orgId = organization?.id;
      let logoUrl = organization?.logo_url || null;

      if (!organization) {
        const newOrg = await createOrganization({
          name: orgName,
          email: orgEmail,
          phone: orgPhone,
          address: orgAddress,
          website: orgWebsite,
          license_number: orgLicense,
        });
        orgId = newOrg.id;
      }

      if (logoFile && orgId) {
        try {
          const fileExt = logoFile.name.split(".").pop();
          const fileName = `${orgId}-logo.${fileExt}`;
          const path = `logos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("report-media")
            .upload(path, logoFile, { upsert: true });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("report-media").getPublicUrl(path);

          logoUrl = publicUrl;

          if (organization?.logo_url) {
            const oldPath = getStoragePathFromPublicUrl(organization.logo_url);
            if (oldPath && oldPath !== path) {
              const { error: removeError } = await supabase.storage
                .from("report-media")
                .remove([oldPath]);
              if (removeError) {
                toast({
                  title: "Failed to delete previous logo",
                  description: removeError.message,
                  variant: "destructive",
                });
              } else {
                toast({ title: "Previous logo deleted" });
              }
            }
          }
        } catch (error) {
          toast({
            title: "Failed to upload logo",
            description: (error as Error).message,
            variant: "destructive",
          });
          return;
        }
      }

      if (orgId) {
        await updateOrganizationMutation.mutateAsync({
          id: orgId,
          data: {
            name: orgName,
            email: orgEmail,
            phone: orgPhone,
            address: orgAddress,
            website: orgWebsite,
            license_number: orgLicense,
            logo_url: logoUrl,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["my-organization"] });
      }
    } catch (error) {
      toast({
        title: "Failed to save organization",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Seo title="Organization Settings" description="Manage your organization" />
      {showOrganizationError && organizationError && (
        <Alert variant="destructive" className="relative mb-6">
          <AlertTitle>Failed to load organization</AlertTitle>
          <AlertDescription>
            {organizationError instanceof Error
              ? organizationError.message
              : JSON.stringify(organizationError)}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => setShowOrganizationError(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {organizationLoading && <div>Loading organization...</div>}
      {!organizationLoading && !organizationError && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orgName">Company Name *</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your Company Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orgEmail">Business Email *</Label>
                  <Input
                    id="orgEmail"
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    placeholder="contact@company.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orgPhone">Business Phone *</Label>
                  <Input
                    id="orgPhone"
                    type="tel"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orgLicense">License Number</Label>
                  <Input
                    id="orgLicense"
                    value={orgLicense}
                    onChange={(e) => setOrgLicense(e.target.value)}
                    placeholder="Professional license number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="orgAddress">Business Address *</Label>
                  <Input
                    id="orgAddress"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    placeholder="Street address, City, State, ZIP"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="orgWebsite">Website</Label>
                  <Input
                    id="orgWebsite"
                    type="url"
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                    placeholder="https://www.yourcompany.com"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 rounded-lg">
                    <AvatarImage src={logoPreview || organization?.logo_url || ""} className="object-cover" />
                    <AvatarFallback className="rounded-lg bg-muted">
                      <Building2 className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  {(logoPreview || organization?.logo_url) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border"
                      onClick={handleRemoveLogo}
                    >
                      ×
                    </Button>
                  )}
                </div>
                <div className="space-y-2 w-full max-w-xs">
                  <div
                    {...getRootProps({
                      className:
                        "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors",
                    })}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-4 w-4 mb-2" />
                    <p className="text-sm text-center">
                      {isDragActive ? "Drop the logo here" : "Drag & drop or click"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 200x200px or larger, PNG/JPG format (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                onClick={handleSaveOrganization}
                disabled={updateOrganizationMutation.isPending}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {updateOrganizationMutation.isPending ? "Saving..." : "Save Organization Details"}
              </Button>
              {logoFile && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Logo ready to upload
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default OrganizationSettings;

