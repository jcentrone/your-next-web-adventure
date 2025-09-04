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
  Database, 
  Plug, 
  Briefcase, 
  Calendar,
  Shield,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailTemplate from "./EmailTemplate";
import Account from "./Account";
import Organization from "./Organization";
import Members from "./Members";
import Data from "./Data";
import Integrations from "./Integrations";
import Advanced from "./Advanced";
import Booking from "./Booking";
import Services from "./Services";

const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    { id: "email-template", label: "Email Template", icon: Mail, description: "Customize email notifications" },
    { id: "data", label: "Data", icon: Database, description: "Import, export, and manage data" },
    { id: "integrations", label: "Integrations", icon: Plug, description: "Connect third-party services" },
    { id: "services", label: "Services", icon: Briefcase, description: "Manage your service offerings" },
    { id: "booking", label: "Booking", icon: Calendar, description: "Configure your booking page" },
    ...(isAdminOrOwner ? [{ id: "advanced", label: "Advanced", icon: Shield, description: "Advanced system settings" }] : []),
  ];

  const currentItem = menuItems.find(item => item.id === currentTab);

  const renderContent = () => {
    switch (currentTab) {
      case "account": return <Account />;
      case "organization": return <Organization />;
      case "members": return isAdminOrOwner ? <Members /> : null;
      case "email-template": return <EmailTemplate />;
      case "data": return <Data />;
      case "integrations": return <Integrations />;
      case "services": return <Services />;
      case "booking": return <Booking />;
      case "advanced": return isAdminOrOwner ? <Advanced /> : null;
      default: return <Account />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, organization, and application preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 overflow-hidden border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start h-auto p-4 text-left transition-all duration-200 hover:scale-[1.02] group ${
                          isActive 
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => navigate(item.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"} group-hover:scale-110 transition-transform`} />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                              {item.label}
                            </div>
                            <div className={`text-xs mt-1 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"} line-clamp-2`}>
                              {item.description}
                            </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"} group-hover:translate-x-1 transition-transform`} />
                        </div>
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {currentItem && (
                      <>
                        <currentItem.icon className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-semibold">{currentItem.label}</h2>
                      </>
                    )}
                  </div>
                  {currentItem && (
                    <p className="text-muted-foreground">{currentItem.description}</p>
                  )}
                </div>
                <div className="animate-fade-in">
                  {renderContent()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;