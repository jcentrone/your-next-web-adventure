import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  getMyOrganization,
  getOrganizationMembers,
} from "@/integrations/supabase/organizationsApi";
import EmailTemplate from "./EmailTemplate";
import Account from "./Account";
import Organization from "./Organization";
import Members from "./Members";
import Data from "./Data";
import Integrations from "./Integrations";
import Advanced from "./Advanced";

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentTab = location.pathname.split("/").filter(Boolean).pop() || "account";

  const { data: organization } = useQuery({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organization?.id],
    queryFn: () => (organization ? getOrganizationMembers(organization.id) : []),
    enabled: !!organization,
  });

  const isAdminOrOwner = React.useMemo(() => {
    const membership = members.find((m) => m.user_id === user?.id);
    return membership?.role === "owner" || membership?.role === "admin";
  }, [members, user]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs value={currentTab} onValueChange={(val) => navigate(val)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          {isAdminOrOwner && <TabsTrigger value="members">Members</TabsTrigger>}
          <TabsTrigger value="email-template">Email Template</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          {isAdminOrOwner && <TabsTrigger value="advanced">Advanced</TabsTrigger>}
        </TabsList>
      </Tabs>
      <Routes>
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<Account />} />
        <Route path="organization" element={<Organization />} />
        {isAdminOrOwner && <Route path="members" element={<Members />} />}
        <Route path="email-template" element={<EmailTemplate />} />
        <Route path="data" element={<Data />} />
        <Route path="integrations" element={<Integrations />} />
        {isAdminOrOwner && <Route path="advanced" element={<Advanced />} />}
      </Routes>
    </div>
  );
};

export default Settings;

