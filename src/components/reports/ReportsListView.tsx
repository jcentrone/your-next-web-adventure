import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onManageTags(report)}
                      >
                        <Tag className="h-4 w-4" />
                        <span className="sr-only">Manage tags</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Manage tags</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <Link to={`/reports/${report.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit report</TooltipContent>
                  </Tooltip>

                  {report.reportType === "windMitigation" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => downloadWindMitigationReport(report)}
                        >
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download PDF</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <Link to={`/reports/${report.id}/preview`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview report</TooltipContent>
                  </Tooltip>

                  {onArchive && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => onArchive(report.id, !report.archived)}
                        >
                          {report.archived ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {report.archived ? "Restore" : "Archive"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {report.archived ? "Restore report" : "Archive report"}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => onDelete(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete report</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
