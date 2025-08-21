import React from "react";
import { Link } from "react-router-dom";
import type { CoverPage } from "@/integrations/supabase/coverPagesApi";
import { Button } from "@/components/ui/button";

interface CoverPageListProps {
  coverPages: CoverPage[];
}

export function CoverPageList({ coverPages }: CoverPageListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cover Pages</h2>
        <Button asChild>
          <Link to="/cover-page-manager/new">Create New Cover Page</Link>
        </Button>
      </div>
      <ul className="space-y-2">
        {coverPages.map((cp) => (
          <li
            key={cp.id}
            className="border rounded p-4 flex items-center justify-between"
          >
            <span>{cp.name}</span>
            <Button asChild variant="outline" size="sm">
              <Link to={`/cover-page-manager/${cp.id}`}>Edit</Link>
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
