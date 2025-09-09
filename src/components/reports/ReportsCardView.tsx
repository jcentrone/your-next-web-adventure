import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Archive, ArchiveRestore, Eye, Pencil, Trash2, Tag } from "lucide-react";
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
          <p className="text-sm text-muted-foreground mb-4">
            {/* inspectionDate is ISO; show local date */}
            {new Date(r.inspectionDate).toLocaleDateString()} • {r.clientName}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {!r.archived && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="border"
                      onClick={() => onManageTags(r)}
                    >
                      <Tag className="h-4 w-4" />
                      <span className="sr-only">Manage tags</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Manage tags</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="sm" variant="ghost" className="border">
                      <Link to={`/reports/${r.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit report</TooltipContent>
                </Tooltip>
                
                {r.reportType === "wind_mitigation" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border"
                        onClick={() => downloadWindMitigationReport(r.id)}
                      >
                        Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild size="sm" variant="ghost" className="border">
                        <Link to={`/reports/${r.id}/preview`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview report</TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
            
            {onArchive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="border"
                    onClick={() => onArchive(r.id, !r.archived)}
                  >
                    {r.archived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                    <span className="sr-only">{r.archived ? "Restore" : "Archive"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{r.archived ? "Restore report" : "Archive report"}</TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="destructive" className="border" onClick={() => onDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete report</TooltipContent>
            </Tooltip>
          </div>
        </article>
      ))}
    </div>
  );
};