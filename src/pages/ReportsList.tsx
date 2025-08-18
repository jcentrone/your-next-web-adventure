
import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { listReports as listLocalReports, deleteReport as deleteLocalReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dbListReports, dbDeleteReport, dbArchiveReport } from "@/integrations/supabase/reportsApi";
import { ReportsListView } from "@/components/reports/ReportsListView";
import { ReportsCardView } from "@/components/reports/ReportsCardView";
import { ReportsViewToggle } from "@/components/reports/ReportsViewToggle";
import { ReportsFilterToggle } from "@/components/reports/ReportsFilterToggle";

const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const [localItems, setLocalItems] = React.useState(listLocalReports());
  const [view, setView] = React.useState<"list" | "card">("list"); // Default to list view
  const [showArchived, setShowArchived] = React.useState(false);
  const [reportTypeFilter, setReportTypeFilter] = React.useState<"all" | "home_inspection" | "wind_mitigation">("all");

  const { data: remoteItems, refetch, isLoading } = useQuery({
    queryKey: ["reports", user?.id, showArchived],
    queryFn: async () => {
      if (!user) return null;
      return await dbListReports(user.id, showArchived);
    },
    enabled: !!user,
  });

  // Get archived count for badge
  const { data: archivedItems } = useQuery({
    queryKey: ["reports", user?.id, "archived"],
    queryFn: async () => {
      if (!user) return [];
      return await dbListReports(user.id, true);
    },
    enabled: !!user,
  });

  const items = user ? remoteItems || [] : localItems;
  const archivedCount = archivedItems?.filter(item => item.archived).length || 0;
  
  // Filter items by report type
  const filteredItems = items.filter((item: any) => {
    if (reportTypeFilter === "all") return true;
    return item.reportType === reportTypeFilter;
  });

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

  const onArchive = async (id: string, archived: boolean) => {
    try {
      if (user) {
        await dbArchiveReport(id, archived);
        await refetch();
        toast({ title: archived ? "Report archived" : "Report restored" });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to update report", description: e?.message || "Please try again." });
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
          <h1 className="text-2xl font-semibold">
            {showArchived ? "Archived Reports" : "Inspection Reports"}
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <ReportsFilterToggle 
                showArchived={showArchived} 
                onToggle={setShowArchived}
                archivedCount={archivedCount}
                reportType={reportTypeFilter}
                onReportTypeChange={setReportTypeFilter}
              />
            )}
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
        ) : filteredItems.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              {showArchived ? "No archived reports." : 
               reportTypeFilter !== "all" ? `No ${reportTypeFilter === "wind_mitigation" ? "wind mitigation" : "home inspection"} reports found.` : 
               "No reports yet."}
            </p>
            {!showArchived && (
              <Button asChild>
                <Link to="/reports/new">Create your first report</Link>
              </Button>
            )}
          </div>
        ) : (
          view === "list" ? (
            <ReportsListView reports={filteredItems} onDelete={onDelete} onArchive={user ? onArchive : undefined} showArchived={showArchived} />
          ) : (
            <ReportsCardView reports={filteredItems} onDelete={onDelete} onArchive={user ? onArchive : undefined} showArchived={showArchived} />
          )
        )}
      </section>
    </>
  );
};

export default ReportsList;
