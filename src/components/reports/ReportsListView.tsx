import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Trash2, Archive, ArchiveRestore, Wind, Flame, ShieldCheck, Home, Pencil } from "lucide-react";
import { downloadWindMitigationReport } from "@/utils/fillWindMitigationPDF";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { Report } from "@/lib/reportSchemas";

interface ReportsListViewProps {
  reports: any[];
  onDelete: (id: string) => void;
  onArchive?: (id: string, archived: boolean) => void;
  showArchived?: boolean;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({ 
  reports, 
  onDelete, 
  onArchive, 
  showArchived = false 
}) => {
  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {(report.reportType as string).includes("wind") ? (
                <Wind className="h-5 w-5 text-muted-foreground" />
              ) : (report.reportType as string).includes("wildfire") ? (
                <Flame className="h-5 w-5 text-muted-foreground" />
              ) : (report.reportType as string).includes("roof") ? (
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              ) : (report.reportType as string).includes("home") ? (
                <Home className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">
                    {report.title || "Untitled Report"}
                  </h3>
                  <Badge variant="secondary">
                    {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                  </Badge>
                  {report.archived && (
                    <Badge variant="outline">Archived</Badge>
                  )}
                </div>
                {report.address && (
                  <p className="text-sm text-muted-foreground truncate">
                    {report.address}
                  </p>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  {report.inspectionDate && (
                    <span>Inspection: {new Date(report.inspectionDate).toLocaleDateString()}</span>
                  )}
                  {report.clientName && (
                    <span className="ml-4">Client: {report.clientName}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" asChild>
                <Link to={`/reports/${report.id}`}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
              {report.reportType === "windMitigation" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadWindMitigationReport(report)}
                >
                  Download
                </Button>
              )}
              <Button size="sm" variant="ghost" asChild>
                <Link to={`/reports/${report.id}/preview`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Preview</span>
                </Link>
              </Button>
              {onArchive && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onArchive(report.id, !report.archived)}
                >
                  {report.archived ? (
                    <ArchiveRestore className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                  <span className="sr-only">{report.archived ? "Restore" : "Archive"}</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
