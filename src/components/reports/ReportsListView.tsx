import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Eye,
  Trash2,
  Archive,
  ArchiveRestore,
  Wind,
  Flame,
  ShieldCheck,
  Home,
  Pencil,
  Tag,
} from "lucide-react";
import { ActionsMenu, ActionItem } from "@/components/ui/actions-menu";
import { downloadWindMitigationReport } from "@/utils/fillWindMitigationPDF";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { Report } from "@/lib/reportSchemas";

interface ReportsListViewProps {
  reports: Report[];
  onDelete: (id: string) => void;
  onArchive?: (id: string, archived: boolean) => void;
  showArchived?: boolean;
  onManageTags: (report: Report) => void;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({
  reports,
  onDelete,
  onArchive,
  showArchived: _showArchived = false,
  onManageTags,
}) => {
  const getReportIcon = (type: string) => {
    if (type.includes("wind")) return <Wind className="h-4 w-4 text-muted-foreground" />;
    if (type.includes("wildfire")) return <Flame className="h-4 w-4 text-muted-foreground" />;
    if (type.includes("roof")) return <ShieldCheck className="h-4 w-4 text-muted-foreground" />;
    if (type.includes("home")) return <Home className="h-4 w-4 text-muted-foreground" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Inspection</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="group">
              <TableCell>
                <div className="flex items-center gap-2">
                  {getReportIcon(report.reportType as string)}
                  <Link
                    to={`/reports/${report.id}`}
                    className="font-medium hover:text-primary transition-colors truncate"
                  >
                    {report.title || "Untitled Report"}
                  </Link>
                  {report.archived && (
                    <Badge variant="outline" className="ml-2">Archived</Badge>
                  )}
                </div>
                {report.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                </Badge>
              </TableCell>
              <TableCell>{report.clientName || "-"}</TableCell>
              <TableCell>
                {report.inspectionDate
                  ? new Date(report.inspectionDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {report.address || "-"}
              </TableCell>
              <TableCell className="text-right">
                <ActionsMenu 
                  actions={[
                    {
                      key: "tags",
                      label: "Manage Tags",
                      icon: <Tag className="h-4 w-4" />,
                      onClick: () => onManageTags(report),
                    },
                    {
                      key: "edit",
                      label: "Edit Report",
                      icon: <Pencil className="h-4 w-4" />,
                      onClick: () => window.location.href = `/reports/${report.id}`,
                    },
                    ...(report.reportType === "wind_mitigation" ? [{
                      key: "download",
                      label: "Download PDF",
                      icon: <FileText className="h-4 w-4" />,
                      onClick: () => downloadWindMitigationReport(report.id),
                    }] : []),
                    {
                      key: "preview",
                      label: "Preview Report",
                      icon: <Eye className="h-4 w-4" />,
                      onClick: () => window.location.href = `/reports/${report.id}/preview`,
                    },
                    ...(onArchive ? [{
                      key: "archive",
                      label: report.archived ? "Restore Report" : "Archive Report",
                      icon: report.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />,
                      onClick: () => onArchive(report.id, !report.archived),
                    }] : []),
                    {
                      key: "delete",
                      label: "Delete Report",
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: () => onDelete(report.id),
                      variant: "destructive" as const,
                    },
                  ] as ActionItem[]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
