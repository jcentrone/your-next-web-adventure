import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Seo from "@/components/Seo";
import {
  getMyProfile,
  updateMyProfile,
  getMyOrganization,
  updateOrganization,
  getOrganizationMembers,
  inviteUserToOrganization,
  getOrganizationInvitations,
  removeMemberFromOrganization,
  updateMemberRole
} from "@/integrations/supabase/organizationsApi";
import { Building2, Mail, Phone, Users, Plus, Trash2, Settings } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
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

  // Invitation form state
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"admin" | "inspector" | "viewer">("inspector");

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: !!user,
  });

  const { data: organization } = useQuery({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user && !!profile && !profile.is_individual,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organization?.id],
    queryFn: () => organization ? getOrganizationMembers(organization.id) : [],
    enabled: !!organization,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["organization-invitations", organization?.id],
    queryFn: () => organization ? getOrganizationInvitations(organization.id) : [],
    enabled: !!organization,
  });

  // Initialize form state when data loads
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setLicenseNumber(profile.license_number || "");
    }
  }, [profile]);

  React.useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "");
      setOrgEmail(organization.email || "");
      setOrgPhone(organization.phone || "");
      setOrgAddress(organization.address || "");
      setOrgWebsite(organization.website || "");
      setOrgLicense(organization.license_number || "");
    }
  }, [organization]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update profile", description: error.message });
    },
  });

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

  const inviteUserMutation = useMutation({
    mutationFn: inviteUserToOrganization,
    onSuccess: () => {
      toast({ title: "Invitation sent successfully" });
      setInviteEmail("");
      setInviteRole("inspector");
      queryClient.invalidateQueries({ queryKey: ["organization-invitations"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send invitation", description: error.message });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) => 
      removeMemberFromOrganization(orgId, userId),
    onSuccess: () => {
      toast({ title: "Member removed successfully" });
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove member", description: error.message });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      full_name: fullName,
      phone: phone,
      license_number: licenseNumber,
    });
  };

  const handleSaveOrganization = () => {
    if (!organization) return;
    updateOrganizationMutation.mutate({
      id: organization.id,
      data: {
        name: orgName,
        email: orgEmail,
        phone: orgPhone,
        address: orgAddress,
        website: orgWebsite,
        license_number: orgLicense,
      },
    });
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
    removeMemberMutation.mutate({ orgId: organization.id, userId });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const myMembership = members.find(m => m.user_id === user?.id);
  const canManageMembers = myMembership?.role === "owner" || myMembership?.role === "admin";

  if (!user || !profile) {
    return <div>Loading...</div>;
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

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            {!profile.is_individual && (
              <>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                {canManageMembers && <TabsTrigger value="members">Members</TabsTrigger>}
              </>
            )}
          </TabsList>

          <TabsContent value="profile">
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
                  <Badge variant={profile.is_individual ? "default" : "secondary"}>
                    {profile.is_individual ? "Individual Inspector" : "Organization Member"}
                  </Badge>
                  {!profile.is_individual && organization && (
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

          {!profile.is_individual && organization && (
            <TabsContent value="organization">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orgEmail">Email</Label>
                      <Input
                        id="orgEmail"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        placeholder="company@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orgPhone">Phone</Label>
                      <Input
                        id="orgPhone"
                        value={orgPhone}
                        onChange={(e) => setOrgPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orgLicense">License Number</Label>
                      <Input
                        id="orgLicense"
                        value={orgLicense}
                        onChange={(e) => setOrgLicense(e.target.value)}
                        placeholder="Organization license"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="orgAddress">Address</Label>
                      <Input
                        id="orgAddress"
                        value={orgAddress}
                        onChange={(e) => setOrgAddress(e.target.value)}
                        placeholder="Business address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="orgWebsite">Website</Label>
                      <Input
                        id="orgWebsite"
                        value={orgWebsite}
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveOrganization}
                    disabled={updateOrganizationMutation.isPending}
                  >
                    {updateOrganizationMutation.isPending ? "Saving..." : "Save Organization"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!profile.is_individual && canManageMembers && (
            <TabsContent value="members">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
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
                      <Users className="h-5 w-5" />
                      Current Members ({members.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.profiles?.avatar_url || ""} />
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
                            <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                              {member.role}
                            </Badge>
                            {member.role !== "owner" && myMembership?.role === "owner" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.user_id)}
                                disabled={removeMemberMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
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
                        <Mail className="h-5 w-5" />
                        Pending Invitations ({invitations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {invitations.map((invitation) => (
                          <div key={invitation.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Invited as {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
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