import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Seo from "@/components/Seo";
import {
  getMyOrganization,
  getOrganizationMembers,
  getOrganizationInvitations,
  inviteUserToOrganization,
  removeMemberFromOrganization,
  type Organization,
} from "@/integrations/supabase/organizationsApi";
import { Plus, Users, Mail, Trash2 } from "lucide-react";

const Members: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"admin" | "inspector" | "viewer">("inspector");

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

  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organization?.id],
    queryFn: () => (organization ? getOrganizationMembers(organization.id) : []),
    enabled: !!organization,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["organization-invitations", organization?.id],
    queryFn: () => (organization ? getOrganizationInvitations(organization.id) : []),
    enabled: !!organization,
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const myMembership = members.find((m: any) => m.user_id === user?.id);
  const canManageMembers = myMembership?.role === "owner" || myMembership?.role === "admin";

  if (organizationLoading) {
    return <div>Loading organization...</div>;
  }

  if (organizationError || !organization || !canManageMembers) {
    return <div>You do not have permission to manage members.</div>;
  }

  return (
    <>
      <Seo title="Organization Members" description="Manage organization members" />
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
              <Button onClick={handleInviteUser} disabled={inviteUserMutation.isPending || !inviteEmail}>
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
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
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
                {invitations.map((invitation: any) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
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
    </>
  );
};

export default Members;

