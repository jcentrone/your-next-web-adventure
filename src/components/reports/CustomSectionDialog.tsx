import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { customSectionsApi } from "@/integrations/supabase/customSectionsApi";

interface CustomSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  organizationId?: string;
  onSectionCreated: () => void;
}

export const CustomSectionDialog: React.FC<CustomSectionDialogProps> = ({
  open,
  onOpenChange,
  userId,
  organizationId,
  onSectionCreated,
}) => {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Section title is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await customSectionsApi.createCustomSection(userId, title.trim(), organizationId);
      
      toast({
        title: "Success",
        description: "Custom section created successfully",
      });
      
      setTitle("");
      onSectionCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating custom section:", error);
      toast({
        title: "Error",
        description: "Failed to create custom section",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Section</DialogTitle>
          <DialogDescription>
            Create a new inspection section that will be added to all your reports.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pool & Spa, Security Systems"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Section"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};