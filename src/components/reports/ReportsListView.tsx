import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Trash2, Archive, ArchiveRestore, Wind, Flame } from "lucide-react";
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
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{report.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{report.clientName}</span>
                <span>{new Date(report.inspectionDate).toLocaleDateString()}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                >
                  {REPORT_TYPE_LABELS[report.reportType as Report["reportType"]]}
                </Badge>
                {report.status && (
                  <Badge variant={report.status === "Final" ? "default" : "secondary"} className="text-xs">
                    {report.status}
                  </Badge>
                )}
                {report.archived && (
                  <Badge variant="outline" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!report.archived && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/reports/${report.id}`}>
                    <FileText className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                {report.reportType === "wind_mitigation" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadWindMitigationReport(report.id)}
                  >
                    Download
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/reports/${report.id}/preview`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                )}
              </>
            )}
            {onArchive && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onArchive(report.id, !report.archived)}
                title={report.archived ? "Restore report" : "Archive report"}
              >
                {report.archived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(report.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};