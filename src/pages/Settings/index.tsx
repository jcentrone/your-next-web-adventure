import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportEmailTemplate from "./ReportEmailTemplate";

const Account = () => <div>Account settings</div>;
const Organization = () => <div>Organization settings</div>;
const Members = () => <div>Members settings</div>;
const Data = () => <div>Data settings</div>;

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split("/").filter(Boolean).pop() || "account";

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs value={currentTab} onValueChange={(val) => navigate(val)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="email-template">Email Template</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
      </Tabs>
      <Routes>
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<Account />} />
        <Route path="organization" element={<Organization />} />
        <Route path="members" element={<Members />} />
        <Route path="email-template" element={<ReportEmailTemplate />} />
        <Route path="data" element={<Data />} />
      </Routes>
    </div>
  );
};

export default Settings;
