import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, FileText, Wind } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Report } from "@/lib/reportSchemas";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";

interface ReportsFilterToggleProps {
  showArchived: boolean;
  onToggle: (showArchived: boolean) => void;
  archivedCount?: number;
  reportType?: Report["reportType"] | "all";
  onReportTypeChange?: (reportType: Report["reportType"] | "all") => void;
}

export const ReportsFilterToggle: React.FC<ReportsFilterToggleProps> = ({ 
  showArchived, 
  onToggle, 
  archivedCount = 0,
  reportType = "all",
  onReportTypeChange
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Report Type Filter */}
      {onReportTypeChange && (
        <Select value={reportType} onValueChange={onReportTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Report Types</SelectItem>
            {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => {
              const Icon = value.includes("wind") ? Wind : FileText;
              return (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
      
      {/* Archive Filter */}
      <div className="flex items-center gap-1 border rounded-md p-1">
        <Button
          size="sm"
          variant={!showArchived ? "secondary" : "ghost"}
          onClick={() => onToggle(false)}
          className="h-8 px-3"
        >
          <FileText className="h-4 w-4 mr-1" />
          Active
        </Button>
        <Button
          size="sm"
          variant={showArchived ? "secondary" : "ghost"}
          onClick={() => onToggle(true)}
          className="h-8 px-3"
        >
          <Archive className="h-4 w-4 mr-1" />
          Archived
          {archivedCount > 0 && (
            <Badge variant="outline" className="ml-1 text-xs">
              {archivedCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};