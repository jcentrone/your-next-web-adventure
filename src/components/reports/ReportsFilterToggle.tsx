import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, ArchiveRestore, FileText } from "lucide-react";

interface ReportsFilterToggleProps {
  showArchived: boolean;
  onToggle: (showArchived: boolean) => void;
  archivedCount?: number;
}

export const ReportsFilterToggle: React.FC<ReportsFilterToggleProps> = ({ 
  showArchived, 
  onToggle, 
  archivedCount = 0 
}) => {
  return (
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
  );
};