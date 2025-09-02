import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, ArchiveRestore, FileText, Wind } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportsFilterToggleProps {
  showArchived: boolean;
  onToggle: (showArchived: boolean) => void;
  archivedCount?: number;
  reportType?: "all" | "home_inspection" | "wind_mitigation";
  onReportTypeChange?: (reportType: "all" | "home_inspection" | "wind_mitigation") => void;
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
            <SelectItem value="home_inspection">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Home Inspection
              </div>
            </SelectItem>
            <SelectItem value="wind_mitigation">
              <div className="flex items-center">
                <Wind className="h-4 w-4 mr-2" />
                Uniform Mitigation
              </div>
            </SelectItem>
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