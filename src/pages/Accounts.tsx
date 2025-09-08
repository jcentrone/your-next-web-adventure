import { useState, useEffect } from "react";
import { Plus, Search, Building2, Users, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { accountsApi } from "@/integrations/supabase/accountsApi";
import { useAuth } from "@/contexts/AuthContext";
import { AccountsViewToggle } from "@/components/accounts/AccountsViewToggle";
import { AccountsFilter } from "@/components/accounts/AccountsFilter";
import { AccountsListView } from "@/components/accounts/AccountsListView";
import type { Account } from "@/lib/accountSchemas";

export default function Accounts() {
  const isMobile = useIsMobile();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "card">("list");
  const effectiveView = isMobile ? "card" : view;
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, selectedType, selectedIndustry]);

  const loadAccounts = async () => {
    try {
      const data = await accountsApi.list(user!.id);
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Text search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(account => account.type === selectedType);
    }

    // Industry filter
    if (selectedIndustry) {
      filtered = filtered.filter(account => account.industry === selectedIndustry);
    }

    setFilteredAccounts(filtered);
  };

  const availableIndustries = [...new Set(accounts.map(account => account.industry).filter(Boolean))] as string[];

  const formatRevenue = (revenue?: number) => {
    if (!revenue) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(revenue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Mobile Header */}
      {isMobile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Accounts</h1>
            <Button asChild size="sm">
              <Link to="/accounts/new">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">Manage your client organizations</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <AccountsFilter
              selectedType={selectedType}
              selectedIndustry={selectedIndustry}
              onTypeChange={setSelectedType}
              onIndustryChange={setSelectedIndustry}
              availableIndustries={availableIndustries}
            />
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Accounts</h1>
              <p className="text-muted-foreground">Manage your company accounts and client organizations</p>
            </div>
            <Button asChild>
              <Link to="/accounts/new">
                <Plus className="w-4 h-4 mr-2" />
                New Account
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <AccountsFilter
                selectedType={selectedType}
                selectedIndustry={selectedIndustry}
                onTypeChange={setSelectedType}
                onIndustryChange={setSelectedIndustry}
                availableIndustries={availableIndustries}
              />
            </div>
            {!isMobile && <AccountsViewToggle view={view} onViewChange={setView} />}
          </div>
        </>
      )}

      {filteredAccounts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No accounts match your search criteria." : "Get started by creating your first account."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/accounts/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : effectiveView === "list" ? (
        <AccountsListView 
          accounts={filteredAccounts} 
          formatRevenue={formatRevenue}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <Badge variant="secondary">{account.type}</Badge>
                </div>
                {account.industry && (
                  <p className="text-sm text-muted-foreground">{account.industry}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {account.address && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{account.city}, {account.state}</span>
                  </div>
                )}
                
                {account.employee_count && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{account.employee_count} employees</span>
                  </div>
                )}

                {account.annual_revenue && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Revenue: </span>
                    <span className="font-medium">{formatRevenue(account.annual_revenue)}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/accounts/${account.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}