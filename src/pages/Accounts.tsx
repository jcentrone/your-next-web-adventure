import { useState, useEffect } from "react";
import { Plus, Search, Building2, Users, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { accountsApi } from "@/integrations/supabase/accountsApi";
import { accountsTagsApi } from "@/integrations/supabase/accountsTagsApi";
import { useAuth } from "@/contexts/AuthContext";
import { AccountsViewToggle } from "@/components/accounts/AccountsViewToggle";
import { AccountsFilter } from "@/components/accounts/AccountsFilter";
import { AccountsListView } from "@/components/accounts/AccountsListView";
import { AccountsCardView } from "@/components/accounts/AccountsCardView";
import type { Account } from "@/lib/accountSchemas";
import { ManageTagsDialog } from "@/components/modals/ManageTagsDialog";

export default function Accounts() {
  const isMobile = useIsMobile();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "card">("list");
  const effectiveView = isMobile ? "card" : view;
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAccounts();
      loadTagSuggestions();
    }
  }, [user]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, selectedType, selectedIndustry, selectedTags]);

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

  const loadTagSuggestions = async () => {
    try {
      const tags = await accountsTagsApi.list();
      setTagSuggestions(tags.map((t) => t.name));
    } catch (error) {
      console.error('Error loading tag suggestions:', error);
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

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(account =>
        selectedTags.every(tag => account.tags?.includes(tag))
      );
    }

    setFilteredAccounts(filtered);
  };

  const availableIndustries = [...new Set(accounts.map(account => account.industry).filter(Boolean))] as string[];

  const handleManageTags = (account: Account) => {
    setSelectedAccount(account);
    setTagDialogOpen(true);
  };

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
    <>
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
            <TagInput
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Filter tags"
              suggestions={tagSuggestions}
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
              <div className="max-w-sm">
                <TagInput
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Filter tags"
                  suggestions={tagSuggestions}
                />
              </div>
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
          onManageTags={handleManageTags}
        />
      ) : (
        <AccountsCardView
          accounts={filteredAccounts}
          formatRevenue={formatRevenue}
          onManageTags={handleManageTags}
        />
      )}
    </div>
    {selectedAccount && (
      <ManageTagsDialog
        open={tagDialogOpen}
        onOpenChange={(open) => {
          setTagDialogOpen(open);
          if (!open) setSelectedAccount(null);
        }}
        module="accounts"
        recordId={selectedAccount.id}
        initialTags={selectedAccount.tags || []}
        onTagsUpdated={(tags) => {
          setAccounts((prev) =>
            prev.map((a) => (a.id === selectedAccount.id ? { ...a, tags } : a))
          );
        }}
      />
    )}
    </>
  );
}
