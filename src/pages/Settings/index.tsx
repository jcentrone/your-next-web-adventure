import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  getMyOrganization,
  getOrganizationMembers,
} from "@/integrations/supabase/organizationsApi";
import { 
  User, 
  Building2, 
  Users,
  Mail,
  FileText,
  Database,
  Plug,
  Briefcase,
  Calendar,
  Shield,
  Settings2
} from "lucide-react";
import EmailTemplate from "./EmailTemplate";
import Account from "./Account";
import Organization from "./Organization";
import Members from "./Members";
import TermsAndConditions from "./TermsAndConditions";
import Data from "./Data";
import Integrations from "./Integrations";
import Advanced from "./Advanced";
import Booking from "./Booking";
import Services from "./Services";
import SectionManager from "./SectionManager";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const currentTab = location.pathname.split("/").filter(Boolean).pop() || "account";

  React.useEffect(() => {
    if (currentTab === "settings") {
      navigate("account", { replace: true });
    }
  }, [currentTab, navigate]);

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

  const menuItems = [
    { id: "account", label: "Account", icon: User, description: "Manage your personal account settings" },
    { id: "organization", label: "Organization", icon: Building2, description: "Company profile and branding" },
    ...(isAdminOrOwner ? [{ id: "members", label: "Members", icon: Users, description: "Manage team members and permissions" }] : []),
    { id: "terms-and-conditions", label: "Terms & Conditions", icon: FileText, description: "Manage terms and conditions" },
    { id: "email-template", label: "Email Template", icon: Mail, description: "Customize email notifications" },
    { id: "data", label: "Data", icon: Database, description: "Import, export, and manage data" },
    { id: "integrations", label: "Integrations", icon: Plug, description: "Connect third-party services" },
    { id: "services", label: "Services", icon: Briefcase, description: "Manage your service offerings" },
    { id: "booking", label: "Booking", icon: Calendar, description: "Configure your booking page" },
    { id: "section-manager", label: "Section Manager", icon: Settings2, description: "Manage custom sections and fields" },
    ...(isAdminOrOwner ? [{ id: "advanced", label: "Advanced", icon: Shield, description: "Advanced system settings" }] : []),
  ];

  const currentItem = menuItems.find(item => item.id === currentTab);

  const renderContent = () => {
    switch (currentTab) {
      case "account": return <Account />;
      case "organization": return <Organization />;
      case "members": return isAdminOrOwner ? <Members /> : null;
      case "terms-and-conditions": return <TermsAndConditions />;
      case "email-template": return <EmailTemplate />;
      case "data": return <Data />;
      case "integrations": return <Integrations />;
      case "services": return <Services />;
      case "booking": return <Booking />;
      case "section-manager": return <SectionManager />;
      case "advanced": return isAdminOrOwner ? <Advanced /> : null;
      default: return <Account />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-muted/30 border-r border-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your preferences
          </p>
        </div>
        
        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-foreground"
                }`}
                onClick={() => navigate(item.id)}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.label}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentItem && (
                  <>
                    <currentItem.icon className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">{currentItem.label}</h2>
                  </>
                )}
              </div>
              {currentTab === "account" && (
                <Button variant="outline" onClick={resetOnboarding}>
                  Restart Tour
                </Button>
              )}
            </div>
            {currentItem && (
              <p className="text-sm text-muted-foreground mt-1">{currentItem.description}</p>
            )}
          </div>
          
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;