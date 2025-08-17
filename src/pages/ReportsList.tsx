
import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { listReports as listLocalReports, deleteReport as deleteLocalReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dbListReports, dbDeleteReport } from "@/integrations/supabase/reportsApi";
import { ReportsListView } from "@/components/reports/ReportsListView";
import { ReportsCardView } from "@/components/reports/ReportsCardView";
import { ReportsViewToggle } from "@/components/reports/ReportsViewToggle";

const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const [localItems, setLocalItems] = React.useState(listLocalReports());
  const [view, setView] = React.useState<"list" | "card">("list"); // Default to list view

  const { data: remoteItems, refetch, isLoading } = useQuery({
    queryKey: ["reports", user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await dbListReports(user.id);
    },
    enabled: !!user,
  });

  const items = user ? remoteItems || [] : localItems;

  const onDelete = async (id: string) => {
    try {
      if (user) {
        await dbDeleteReport(id);
        await refetch();
      } else {
        deleteLocalReport(id);
        setLocalItems(listLocalReports());
      }
      toast({ title: "Report deleted" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to delete report", description: e?.message || "Please try again." });
    }
  };

  return (
    <>
      <Seo
        title="Reports | Home Inspection Reports"
        description="Manage inspection reports. Create, edit, and preview professional home inspection reports."
        canonical={window.location.origin + "/reports"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Reports",
        }}
      />
      <section className="max-w-7xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Inspection Reports</h1>
          <div className="flex items-center gap-4">
            <ReportsViewToggle view={view} onViewChange={setView} />
            <Button asChild>
              <Link to="/reports/new">New Report</Link>
            </Button>
          </div>
        </header>
        {user && isLoading ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="mb-4 text-muted-foreground">No reports yet.</p>
            <Button asChild>
              <Link to="/reports/new">Create your first report</Link>
            </Button>
          </div>
        ) : (
          view === "list" ? (
            <ReportsListView reports={items} onDelete={onDelete} />
          ) : (
            <ReportsCardView reports={items} onDelete={onDelete} />
          )
        )}
      </section>
    </>
  );
};

export default ReportsList;
