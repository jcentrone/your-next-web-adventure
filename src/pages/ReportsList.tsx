
import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { listReports as listLocalReports, deleteReport as deleteLocalReport } from "@/hooks/useLocalDraft";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dbListReports, dbDeleteReport, dbArchiveReport } from "@/integrations/supabase/reportsApi";
import { ReportsListView } from "@/components/reports/ReportsListView";
import { ReportsCardView } from "@/components/reports/ReportsCardView";
import { ReportsViewToggle } from "@/components/reports/ReportsViewToggle";
import { ReportsFilterToggle } from "@/components/reports/ReportsFilterToggle";
import type { Report } from "@/lib/reportSchemas";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";

const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const [localItems, setLocalItems] = React.useState(listLocalReports());
  const [view, setView] = React.useState<"list" | "card">("list"); // Default to list view
  const [showArchived, setShowArchived] = React.useState(false);
  const [reportTypeFilter, setReportTypeFilter] = React.useState<Report["reportType"] | "all">("all");
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

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
  
  // Filter items by report type and archived status
  const filteredItems = items.filter((item: any) => {
    // First filter by archived status
    if (showArchived && !item.archived) return false;
    if (!showArchived && item.archived) return false;
    
    // Then filter by report type
    if (reportTypeFilter === "all") return true;
    return item.reportType === reportTypeFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, showArchived, reportTypeFilter, items]);

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
               reportTypeFilter !== "all" ? `No ${REPORT_TYPE_LABELS[reportTypeFilter]} reports found.` :
               "No reports yet."}
            </p>
            {!showArchived && (
              <Button asChild>
                <Link to="/reports/new">Create your first report</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {view === "list" ? (
              <ReportsListView reports={paginatedItems} onDelete={onDelete} onArchive={user ? onArchive : undefined} showArchived={showArchived} />
            ) : (
              <ReportsCardView reports={paginatedItems} onDelete={onDelete} onArchive={user ? onArchive : undefined} showArchived={showArchived} />
            )}
            {filteredItems.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default ReportsList;
