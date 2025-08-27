import React from "react";
import {useNavigate} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {toast} from "@/components/ui/use-toast";
import {useAuth} from "@/contexts/AuthContext";
import Seo from "@/components/Seo";
import {
    createOrganization,
    getMyOrganization,
    getMyProfile,
    getOrganizationInvitations,
    getOrganizationMembers,
    inviteUserToOrganization,
    type Organization,
    removeMemberFromOrganization,
    updateMyProfile,
    updateOrganization
} from "@/integrations/supabase/organizationsApi";
import {Building2, Camera, Mail, Plus, Settings, Trash2, Upload, Users, X} from "lucide-react";
import {supabase} from "@/integrations/supabase/client";
import {upsertProfile} from "@/lib/upsertProfile";
import {type FileRejection, useDropzone} from "react-dropzone";

const ProfilePage: React.FC = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Profile form state
    const [fullName, setFullName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [licenseNumber, setLicenseNumber] = React.useState("");

    // Organization form state
    const [orgName, setOrgName] = React.useState("");
    const [orgEmail, setOrgEmail] = React.useState("");
    const [orgPhone, setOrgPhone] = React.useState("");
    const [orgAddress, setOrgAddress] = React.useState("");
    const [orgWebsite, setOrgWebsite] = React.useState("");
    const [orgLicense, setOrgLicense] = React.useState("");
    const [logoFile, setLogoFile] = React.useState<File | null>(null);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

    // Invitation form state
    const [inviteEmail, setInviteEmail] = React.useState("");
    const [inviteRole, setInviteRole] = React.useState<"admin" | "inspector" | "viewer">("inspector");
    const [showOrganizationError, setShowOrganizationError] = React.useState(false);

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

    const {
        data: organization,
        isLoading: organizationLoading,
        error: organizationError,
    } = useQuery<Organization | null>({
        queryKey: ["my-organization"],
        queryFn: getMyOrganization,
        enabled: !!user && !!profile,
        retry: false,
    });

    const {data: members = []} = useQuery({
        queryKey: ["organization-members", organization?.id],
        queryFn: () => organization ? getOrganizationMembers(organization.id) : [],
        enabled: !!organization,
    });

    const {data: invitations = []} = useQuery({
        queryKey: ["organization-invitations", organization?.id],
        queryFn: () => organization ? getOrganizationInvitations(organization.id) : [],
        enabled: !!organization,
    });

    React.useEffect(() => {
        if (profileError) {
            supabase.auth.getSession().then(({data: {session}}) => {
                upsertProfile(session).then(() => {
                    queryClient.invalidateQueries({queryKey: ["my-profile"]});
                });
            });
        }
    }, [profileError, queryClient]);

    React.useEffect(() => {
        if (organizationError) {
            setShowOrganizationError(true);
        }
    }, [organizationError]);

    // Initialize form state when data loads
    React.useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            setPhone(profile.phone || "");
            setLicenseNumber(profile.license_number || "");
        }
    }, [profile]);

    React.useEffect(() => {
        setOrgName(organization?.name || "");
        setOrgEmail(organization?.email || "");
        setOrgPhone(organization?.phone || "");
        setOrgAddress(organization?.address || "");
        setOrgWebsite(organization?.website || "");
        setOrgLicense(organization?.license_number || "");
        setLogoPreview(organization?.logo_url || null);
    }, [organization]);

    const updateProfileMutation = useMutation({
        mutationFn: updateMyProfile,
        onSuccess: () => {
            toast({title: "Profile updated successfully"});
            queryClient.invalidateQueries({queryKey: ["my-profile"]});
        },
        onError: (error: any) => {
            toast({title: "Failed to update profile", description: error.message});
        },
    });

    const updateOrganizationMutation = useMutation({
        mutationFn: ({id, data}: { id: string; data: any }) => updateOrganization(id, data),
        onSuccess: () => {
            toast({title: "Organization updated successfully"});
            queryClient.invalidateQueries({queryKey: ["my-organization"]});
        },
        onError: (error: any) => {
            toast({title: "Failed to update organization", description: error.message});
        },
    });

    const inviteUserMutation = useMutation({
        mutationFn: inviteUserToOrganization,
        onSuccess: () => {
            toast({title: "Invitation sent successfully"});
            setInviteEmail("");
            setInviteRole("inspector");
            queryClient.invalidateQueries({queryKey: ["organization-invitations"]});
        },
        onError: (error: any) => {
            toast({title: "Failed to send invitation", description: error.message});
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: ({orgId, userId}: { orgId: string; userId: string }) =>
            removeMemberFromOrganization(orgId, userId),
        onSuccess: () => {
            toast({title: "Member removed successfully"});
            queryClient.invalidateQueries({queryKey: ["organization-members"]});
        },
        onError: (error: any) => {
            toast({title: "Failed to remove member", description: error.message});
        },
    });

    const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
    const MIN_LOGO_DIMENSION = 200;

    const getStoragePathFromPublicUrl = (url: string): string | null => {
        try {
            const {pathname} = new URL(url);
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
                    toast({title: "File rejected", description: error.message, variant: "destructive"});
                }
            });
        });
    }, [toast]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDropAccepted,
        onDropRejected,
        accept: {"image/png": [], "image/jpeg": []},
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
                const {error} = await supabase.storage.from("report-media").remove([path]);
                if (error) throw error;
            }
            await updateOrganization(organization.id, {logo_url: null});
            setLogoPreview(null);
            toast({title: "Logo removed"});
            queryClient.invalidateQueries({queryKey: ["my-organization"]});
        } catch (error) {
            toast({title: "Failed to remove logo", description: (error as Error).message, variant: "destructive"});
        }
    };

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({
            full_name: fullName,
            phone: phone,
            license_number: licenseNumber,
        });
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

            // Upload logo if a new file was selected
            if (logoFile && orgId) {
                try {
                    const fileExt = logoFile.name.split(".").pop();
                    const fileName = `${orgId}-logo.${fileExt}`;
                    const path = `logos/${fileName}`;

                    const {error: uploadError} = await supabase.storage
                        .from("report-media")
                        .upload(path, logoFile, {upsert: true});

                    if (uploadError) throw uploadError;

                    const {
                        data: {publicUrl},
                    } = supabase.storage.from("report-media").getPublicUrl(path);

                    logoUrl = publicUrl;

                    if (organization?.logo_url) {
                        const oldPath = getStoragePathFromPublicUrl(organization.logo_url);
                        if (oldPath && oldPath !== path) {
                            const {error: removeError} = await supabase.storage
                                .from("report-media")
                                .remove([oldPath]);
                            if (removeError) {
                                toast({
                                    title: "Failed to delete previous logo",
                                    description: removeError.message,
                                    variant: "destructive",
                                });
                            } else {
                                toast({title: "Previous logo deleted"});
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
                queryClient.invalidateQueries({queryKey: ["my-organization"]});
            }
        } catch (error) {
            toast({
                title: "Failed to save organization",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    const handleInviteUser = () => {
        if (!organization || !inviteEmail) return;
        inviteUserMutation.mutate({
            organizationId: organization.id,
            email: inviteEmail,
            role: inviteRole,
        });
    };

    const handleRemoveMember = (userId: string) => {
        if (!organization) return;
        removeMemberMutation.mutate({orgId: organization.id, userId});
    };

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const myMembership = members.find(m => m.user_id === user?.id);
    const canManageMembers = myMembership?.role === "owner" || myMembership?.role === "admin";

    if (!user || profileLoading) {
        return <div>Loading...</div>;
    }

    if (profileError) {
        return <div>Error loading profile</div>;
    }

    if (!profile) {
        return <div>No profile data available</div>;
    }

    return (
        <>
            <Seo
                title="Profile Settings"
                description="Manage your profile and organization settings"
            />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your account and organization settings</p>
                </div>

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
                            <X className="h-4 w-4"/>
                        </Button>
                    </Alert>
                )}

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile">Personal Profile</TabsTrigger>
                        <TabsTrigger value="organization">Organization</TabsTrigger>
                        {canManageMembers && <TabsTrigger value="members">Members</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile.avatar_url || ""}/>
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
                                        <Input
                                            id="email"
                                            value={profile.email}
                                            disabled
                                            className="bg-muted"
                                        />
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
                                            value={licenseNumber}
                                            onChange={(e) => setLicenseNumber(e.target.value)}
                                            placeholder="Your license number"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={!organization ? "default" : "secondary"}>
                                        {!organization ? "Individual Inspector" : "Organization Member"}
                                    </Badge>
                                    {organization && (
                                        <Badge variant="outline">{organization.name}</Badge>
                                    )}
                                </div>

                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="organization">
                        {organizationLoading && <div>Loading organization...</div>}
                        {!organizationLoading && !organizationError && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5"/>
                                        Organization Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Business Information */}
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

                                    <Separator/>

                                    {/* Company Logo Section */}
                                    <div className="space-y-4">
                                        <Label>Company Logo</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-20 w-20 rounded-lg">
                                                    <AvatarImage
                                                        src={logoPreview || organization?.logo_url || ""}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="rounded-lg bg-muted">
                                                        <Building2 className="h-8 w-8"/>
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
                                                    <Upload className="h-4 w-4 mb-2"/>
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
                                            <Settings className="h-4 w-4"/>
                                            {updateOrganizationMutation.isPending ? "Saving..." : "Save Organization Details"}
                                        </Button>
                                        {logoFile && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Camera className="h-3 w-3"/>
                                                Logo ready to upload
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {canManageMembers && (
                        <TabsContent value="members">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Plus className="h-5 w-5"/>
                                            Invite New Member
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Email address"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className="flex-1"
                                            />
                                            <select
                                                value={inviteRole}
                                                onChange={(e) => setInviteRole(e.target.value as any)}
                                                className="px-3 py-2 border rounded-md"
                                            >
                                                <option value="inspector">Inspector</option>
                                                <option value="admin">Admin</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                            <Button
                                                onClick={handleInviteUser}
                                                disabled={inviteUserMutation.isPending || !inviteEmail}
                                            >
                                                {inviteUserMutation.isPending ? "Sending..." : "Send Invite"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5"/>
                                            Current Members ({members.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {members.map((member) => (
                                                <div key={member.id}
                                                     className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={member.profiles?.avatar_url || ""}/>
                                                            <AvatarFallback>
                                                                {getInitials(member.profiles?.full_name || member.profiles?.email || "")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{member.profiles?.full_name || "Unnamed"}</p>
                                                            <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={member.role === "owner" ? "default" : "secondary"}>
                                                            {member.role}
                                                        </Badge>
                                                        {member.role !== "owner" && myMembership?.role === "owner" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveMember(member.user_id)}
                                                                disabled={removeMemberMutation.isPending}
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {invitations.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5"/>
                                                Pending Invitations ({invitations.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {invitations.map((invitation) => (
                                                    <div key={invitation.id}
                                                         className="flex items-center justify-between p-3 border rounded">
                                                        <div>
                                                            <p className="font-medium">{invitation.email}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Invited as {invitation.role} •
                                                                Expires {new Date(invitation.expires_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">Pending</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </>
    );
};

export default ProfilePage;