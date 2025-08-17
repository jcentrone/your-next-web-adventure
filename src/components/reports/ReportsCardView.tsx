import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ReportsCardViewProps {
  reports: any[];
  onDelete: (id: string) => void;
}

export const ReportsCardView: React.FC<ReportsCardViewProps> = ({ reports, onDelete }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((r) => (
        <article key={r.id} className="rounded-lg border p-4">
          <h2 className="font-medium">{r.title}</h2>
          <p className="text-sm text-muted-foreground">
            {/* inspectionDate is ISO; show local date */}
            {new Date(r.inspectionDate).toLocaleDateString()} • {/* @ts-ignore clientName exists on both shapes */}
            {r.clientName}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button asChild size="sm">
              <Link to={`/reports/${r.id}`}>Open</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/reports/${r.id}/preview`}>Preview</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
};