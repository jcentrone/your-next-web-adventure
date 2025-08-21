import React from "react";
import type { CoverPage } from "@/integrations/supabase/coverPagesApi";
import { Button } from "@/components/ui/button";

interface CoverPageListProps {
  coverPages: CoverPage[];
  onEdit: (cp: CoverPage) => void;
  onCreate: () => void;
}

export function CoverPageList({ coverPages, onEdit, onCreate }: CoverPageListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cover Pages</h2>
        <Button onClick={onCreate}>New Cover Page</Button>
      </div>
      <ul className="space-y-2">
        {coverPages.map((cp) => (
          <li
            key={cp.id}
            className="border rounded p-4 flex items-center justify-between"
          >
            <span>{cp.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(cp)}
            >
              Edit
            </Button>
          </li>
        ))}
        {coverPages.length === 0 && (
          <li className="text-sm text-muted-foreground">No cover pages yet.</li>
        )}
      </ul>
    </div>
  );
}

export default CoverPageList;
