import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, ArchiveRestore } from "lucide-react";

interface ReportsCardViewProps {
  reports: any[];
  onDelete: (id: string) => void;
  onArchive?: (id: string, archived: boolean) => void;
  showArchived?: boolean;
}

export const ReportsCardView: React.FC<ReportsCardViewProps> = ({ 
  reports, 
  onDelete, 
  onArchive, 
  showArchived = false 
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((r) => (
        <article key={r.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between mb-2">
            <h2 className="font-medium">{r.title}</h2>
            {r.archived && (
              <Badge variant="outline" className="text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {/* inspectionDate is ISO; show local date */}
            {new Date(r.inspectionDate).toLocaleDateString()} • {/* @ts-ignore clientName exists on both shapes */}
            {r.clientName}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {!r.archived && (
              <>
                <Button asChild size="sm">
                  <Link to={`/reports/${r.id}`}>Open</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/reports/${r.id}/preview`}>Preview</Link>
                </Button>
              </>
            )}
            {onArchive && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onArchive(r.id, !r.archived)}
                title={r.archived ? "Restore report" : "Archive report"}
              >
                {r.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
};