import React from "react";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "lucide-react";

interface ReportsViewToggleProps {
  view: "list" | "card";
  onViewChange: (view: "list" | "card") => void;
}

export const ReportsViewToggle: React.FC<ReportsViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        size="sm"
        variant={view === "list" ? "secondary" : "ghost"}
        onClick={() => onViewChange("list")}
        className="h-8 px-3"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={view === "card" ? "secondary" : "ghost"}
        onClick={() => onViewChange("card")}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
};