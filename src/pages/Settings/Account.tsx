import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Seo from "@/components/Seo";
import {
  getMyProfile,
  getMyOrganization,
  updateMyProfile,
  deleteSignature,
  type Organization,
} from "@/integrations/supabase/organizationsApi";
import SignaturePad from "@/components/signature/SignaturePad";

const Account: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: !!user,
  });

  const { data: organization } = useQuery<Organization | null>({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user && !!profile,
    retry: false,
  });

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setLicenseNumber(profile.license_number ?? "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  // Auto-save effect
  const [lastSavedValues, setLastSavedValues] = React.useState<{
    fullName: string;
    phone: string;
    licenseNumber: string;
  } | null>(null);
  
  React.useEffect(() => {
    if (!profile || updateProfileMutation.isPending) return;
    
    const hasChanges = 
      fullName !== (profile.full_name || "") ||
      phone !== (profile.phone || "") ||
      licenseNumber !== (profile.license_number || "");

    const currentValues = { fullName, phone, licenseNumber };
    const isDifferentFromLastSaved = !lastSavedValues || 
      JSON.stringify(currentValues) !== JSON.stringify(lastSavedValues);

    if (hasChanges && isDifferentFromLastSaved) {
      const timeoutId = setTimeout(() => {
        setLastSavedValues(currentValues);
        handleSaveProfile();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [fullName, phone, licenseNumber, profile?.full_name, profile?.phone, profile?.license_number, updateProfileMutation.isPending]);

  const updateSignatureMutation = useMutation({
    mutationFn: async ({ signatureUrl, signatureType }: { signatureUrl: string; signatureType: string }) => {
      return updateMyProfile({
        signature_url: signatureUrl,
        signature_type: signatureType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Failed to update signature",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const deleteSignatureMutation = useMutation({
    mutationFn: async () => {
      if (profile?.signature_url) {
        await deleteSignature(profile.signature_url);
      }
      return updateMyProfile({
        signature_url: null,
        signature_type: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Failed to delete signature",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      full_name: fullName,
      phone,
      license_number: licenseNumber,
    });
  };

  const handleSignatureSave = (signatureUrl: string, signatureType: string) => {
    updateSignatureMutation.mutate({ signatureUrl, signatureType });
  };

  const handleSignatureDelete = () => {
    deleteSignatureMutation.mutate();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user || profileLoading) {
    return <div>Loading...</div>;
  }

  if (profileError || !profile) {
    return <div>Error loading profile</div>;
  }

  return (
    <>
      <Seo title="Account Settings" description="Manage your personal profile" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={licenseNumber || ""}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Your license number"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={!organization ? "default" : "secondary"}>
              {!organization ? "Individual Inspector" : "Organization Member"}
            </Badge>
            {organization && <Badge variant="outline">{organization.name}</Badge>}
          </div>

          {updateProfileMutation.isPending && (
            <div className="text-sm text-muted-foreground">Auto-saving...</div>
          )}
        </CardContent>
      </Card>

      <SignaturePad
        currentSignature={profile.signature_url || undefined}
        currentSignatureType={profile.signature_type || undefined}
        fullName={profile.full_name || undefined}
        onSave={handleSignatureSave}
        onDelete={handleSignatureDelete}
        isLoading={updateSignatureMutation.isPending || deleteSignatureMutation.isPending}
      />
    </>
  );
};

export default Account;

