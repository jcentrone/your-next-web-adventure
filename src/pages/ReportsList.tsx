import React from "react";
import {Link} from "react-router-dom";
import Seo from "@/components/Seo";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {deleteReport as deleteLocalReport, listReports as listLocalReports} from "@/hooks/useLocalDraft";
import {toast} from "@/components/ui/use-toast";
import {useAuth} from "@/contexts/AuthContext";
import {useQuery} from "@tanstack/react-query";
import {dbArchiveReport, dbDeleteReport, dbListReports} from "@/integrations/supabase/reportsApi";
import {ReportsListView} from "@/components/reports/ReportsListView";
import {ReportsCardView} from "@/components/reports/ReportsCardView";
import {ReportsViewToggle} from "@/components/reports/ReportsViewToggle";
import {ReportsFilterToggle} from "@/components/reports/ReportsFilterToggle";
import type {Report} from "@/lib/reportSchemas";
import {REPORT_TYPE_LABELS} from "@/constants/reportTypes";
import {Search, Plus} from "lucide-react";
import {useIsMobile} from "@/hooks/use-mobile";

const ReportsList: React.FC = () => {
    const {user} = useAuth();
    const isMobile = useIsMobile();
    const [localItems, setLocalItems] = React.useState(listLocalReports());
    const [view, setView] = React.useState<"list" | "card">(isMobile ? "card" : "list"); // Default to card on mobile
    const [showArchived, setShowArchived] = React.useState(false);
    const [reportTypeFilter, setReportTypeFilter] = React.useState<Report["reportType"] | "all">("all");
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState("");

    const {data: remoteItems, refetch, isLoading} = useQuery({
        queryKey: ["reports", user?.id, showArchived],
        queryFn: async () => {
            if (!user) return null;
            return await dbListReports(user.id, showArchived);
        },
        enabled: !!user,
    });

    // Get archived count for badge
    const {data: archivedItems} = useQuery({
        queryKey: ["reports", user?.id, "archived"],
        queryFn: async () => {
            if (!user) return [];
            return await dbListReports(user.id, true);
        },
        enabled: !!user,
    });

    const items = user ? remoteItems || [] : localItems;
    const archivedCount = archivedItems?.filter(item => item.archived).length || 0;

    // Filter items by search query, report type, and archived status
    const filteredItems = items.filter((item: any) => {
        // First filter by archived status
        if (showArchived && !item.archived) return false;
        if (!showArchived && item.archived) return false;

        // Filter by report type
        if (reportTypeFilter !== "all" && item.reportType !== reportTypeFilter) {
            return false;
        }

        // Finally filter by search query
        const query = searchQuery.toLowerCase();
        if (query) {
            const title = item.title?.toLowerCase() || "";
            const client = item.clientName?.toLowerCase() || "";
            const address = item.address?.toLowerCase() || "";
            return (
                title.includes(query) ||
                client.includes(query) ||
                address.includes(query)
            );
        }

        return true;
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const paginatedItems = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, showArchived, reportTypeFilter, items, searchQuery]);

    const onDelete = async (id: string) => {
        try {
            if (user) {
                await dbDeleteReport(id);
                await refetch();
            } else {
                deleteLocalReport(id);
                setLocalItems(listLocalReports());
            }
            toast({title: "Report deleted"});
        } catch (e: any) {
            console.error(e);
            toast({title: "Failed to delete report", description: e?.message || "Please try again."});
        }
    };

    const onArchive = async (id: string, archived: boolean) => {
        try {
            if (user) {
                await dbArchiveReport(id, archived);
                await refetch();
                toast({title: archived ? "Report archived" : "Report restored"});
            }
        } catch (e: any) {
            console.error(e);
            toast({title: "Failed to update report", description: e?.message || "Please try again."});
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
                {/* Mobile Header */}
                {isMobile ? (
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold">
                                {showArchived ? "Archived" : "Reports"}
                            </h1>
                            <Button asChild size="sm">
                                <Link to="/reports/new">
                                    <Plus className="w-4 h-4 mr-1" />
                                    New
                                </Link>
                            </Button>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                            <Input
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {user && (
                                <ReportsFilterToggle
                                    showArchived={showArchived}
                                    onToggle={setShowArchived}
                                    archivedCount={archivedCount}
                                    reportType={reportTypeFilter}
                                    onReportTypeChange={setReportTypeFilter}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    /* Desktop Header */
                    <>
                        <header className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-semibold">
                                {showArchived ? "Archived Reports" : "Inspection Reports"}
                            </h1>
                        </header>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center ">
                                <div className="relative flex-1 min-w-lg max-w-lg">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                                    <Input
                                        placeholder="Search reports..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 min-w-[300px] max-w-lg w-full"
                                    />
                                </div>
                            </div>
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
                                {!isMobile && <ReportsViewToggle view={view} onViewChange={setView}/>}
                                <Button asChild>
                                    <Link to="/reports/new">New Report</Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {user && isLoading ? (
                    <div className="rounded-lg border p-8 text-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-lg border p-8 text-center">
                        <p className="mb-4 text-muted-foreground">
                            {showArchived ? "No archived reports." :
                                reportTypeFilter !== "all" ? `No ${REPORT_TYPE_LABELS[reportTypeFilter]} reports found.` :
                                    searchQuery ? "No reports match your search." :
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
                            <ReportsListView reports={paginatedItems} onDelete={onDelete}
                                             onArchive={user ? onArchive : undefined}
                                             showArchived={showArchived}/>
                        ) : (
                            <ReportsCardView reports={paginatedItems} onDelete={onDelete}
                                             onArchive={user ? onArchive : undefined}
                                             showArchived={showArchived}/>
                        )}
                        {filteredItems.length > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2 ps-2">
                                    <span className="text-sm w-[100px]">Rows per page:</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(value) => setItemsPerPage(Number(value))}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Pagination className="justify-end">
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
                                        {Array.from({length: totalPages}).map((_, i) => (
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
