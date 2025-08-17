import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Trash2 } from "lucide-react";

interface ReportsListViewProps {
  reports: any[];
  onDelete: (id: string) => void;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({ reports, onDelete }) => {
  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{report.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{report.clientName}</span>
                <span>{new Date(report.inspectionDate).toLocaleDateString()}</span>
                {report.status && (
                  <Badge variant={report.status === "Final" ? "default" : "secondary"} className="text-xs">
                    {report.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild size="sm" variant="outline">
              <Link to={`/reports/${report.id}`}>
                <FileText className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/reports/${report.id}/preview`}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Link>
            </Button>
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