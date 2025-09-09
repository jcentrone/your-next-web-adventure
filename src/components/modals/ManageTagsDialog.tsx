import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { accountsTagsApi } from "@/integrations/supabase/accountsTagsApi";
import { contactsTagsApi } from "@/integrations/supabase/contactsTagsApi";
import { reportsTagsApi } from "@/integrations/supabase/reportsTagsApi";
import { accountsApi } from "@/integrations/supabase/accountsApi";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { reportsApi } from "@/integrations/supabase/reportsApi";

export type ManageTagsModule = "accounts" | "contacts" | "reports";

interface ManageTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ManageTagsModule;
  recordId: string;
  initialTags: string[];
  onTagsUpdated?: (tags: string[]) => void;
}

export function ManageTagsDialog({
  open,
  onOpenChange,
  module,
  recordId,
  initialTags,
  onTagsUpdated,
}: ManageTagsDialogProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  // Load tags when dialog opens
  useEffect(() => {
    if (!open) return;
    setSelectedTags(initialTags);
    const loadTags = async () => {
      try {
        let tags: { name: string }[] = [];
        if (module === "accounts") {
          tags = await accountsTagsApi.list();
        } else if (module === "contacts") {
          tags = await contactsTagsApi.list();
        } else {
          tags = await reportsTagsApi.list();
        }
        setAvailableTags(tags.map((t) => t.name));
      } catch (error) {
        console.error("Failed to load tags", error);
      }
    };
    loadTags();
  }, [open, module, initialTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddTag = async () => {
    const tagName = newTag.trim();
    if (!tagName || availableTags.includes(tagName)) return;
    try {
      if (module === "accounts") {
        await accountsTagsApi.create(tagName);
      } else if (module === "contacts") {
        await contactsTagsApi.create(tagName);
      } else {
        await reportsTagsApi.create(tagName);
      }
      setAvailableTags((prev) => [...prev, tagName]);
      setSelectedTags((prev) => [...prev, tagName]);
      setNewTag("");
    } catch (error) {
      console.error("Failed to create tag", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (module === "accounts") {
        await accountsApi.update(recordId, { tags: selectedTags });
      } else if (module === "contacts") {
        await contactsApi.update(recordId, { tags: selectedTags });
      } else {
        const report = await reportsApi.dbGetReport(recordId);
        if (report) {
          await reportsApi.dbUpdateReport({ ...report, tags: selectedTags });
        }
      }
      onTagsUpdated?.(selectedTags);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update tags", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add new tag"
            />
            <Button onClick={handleAddTag}>Add</Button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableTags.map((tag) => (
              <label key={tag} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                />
                <span>{tag}</span>
              </label>
            ))}
            {availableTags.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tags available.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ManageTagsDialog;
