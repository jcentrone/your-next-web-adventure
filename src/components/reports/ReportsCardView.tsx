import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, ArchiveRestore, Eye, Pencil, Trash2, Tag, FileText } from "lucide-react";
import { ActionsMenu, ActionItem } from "@/components/ui/actions-menu";
import { downloadWindMitigationReport } from "@/utils/fillWindMitigationPDF";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { Report } from "@/lib/reportSchemas";

interface ReportsCardViewProps {
  reports: Report[];
  onDelete: (id: string) => void;
  onArchive?: (id: string, archived: boolean) => void;
  showArchived?: boolean;
  onManageTags: (report: Report) => void;
}

export const ReportsCardView: React.FC<ReportsCardViewProps> = ({
  reports,
  onDelete,
  onArchive,
  showArchived = false,
  onManageTags
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((r) => (
        <article key={r.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between mb-2">
            <h2 className="font-medium">{r.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {REPORT_TYPE_LABELS[r.reportType as Report["reportType"]]}
              </Badge>
              {r.archived && (
                <Badge variant="outline" className="text-xs">
                  <Archive className="h-3 w-3 mr-1" />
                  Archived
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {new Date(r.inspectionDate).toLocaleDateString()} • {r.clientName}
            </span>
            <ActionsMenu 
              actions={[
                {
                  key: "tags",
                  label: "Manage Tags",
                  icon: <Tag className="h-4 w-4" />,
                  onClick: () => onManageTags(r),
                },
                ...(r.archived ? [] : [
                  {
                    key: "edit",
                    label: "Edit Report",
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => window.location.href = `/reports/${r.id}`,
                  },
                  ...(r.reportType === "wind_mitigation" ? [{
                    key: "download",
                    label: "Download PDF",
                    icon: <FileText className="h-4 w-4" />,
                    onClick: () => downloadWindMitigationReport(r.id),
                  }] : [{
                    key: "preview",
                    label: "Preview Report",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => window.location.href = `/reports/${r.id}/preview`,
                  }]),
                ]),
                ...(onArchive ? [{
                  key: "archive",
                  label: r.archived ? "Restore Report" : "Archive Report",
                  icon: r.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />,
                  onClick: () => onArchive(r.id, !r.archived),
                }] : []),
                {
                  key: "delete",
                  label: "Delete Report",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => onDelete(r.id),
                  variant: "destructive" as const,
                },
              ] as ActionItem[]}
            />
          </div>
        </article>
      ))}
    </div>
  );
};