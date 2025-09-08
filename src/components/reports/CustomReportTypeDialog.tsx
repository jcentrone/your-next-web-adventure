import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCustomReportTypes } from "@/hooks/useCustomReportTypes";

const ICON_OPTIONS = [
  { value: 'FileText', label: 'Document' },
  { value: 'Home', label: 'Home' },
  { value: 'Building', label: 'Building' },
  { value: 'Factory', label: 'Factory' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Wind', label: 'Wind' },
  { value: 'Zap', label: 'Electrical' },
  { value: 'TreePine', label: 'Tree' },
  { value: 'CheckCircle', label: 'Check Circle' },
];

interface CustomReportTypeDialogProps {
  children?: React.ReactNode;
}

export default function CustomReportTypeDialog({ children }: CustomReportTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('FileText');
  const [category, setCategory] = useState('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createCustomType } = useCustomReportTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createCustomType({
        name: name.trim(),
        description: description.trim() || undefined,
        icon_name: iconName,
        category: category,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIconName('FileText');
      setCategory('custom');
      setOpen(false);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Report Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Report Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Report Type Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pool Inspection, Mold Assessment"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this report type..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={iconName} onValueChange={setIconName}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., residential, commercial, specialty"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Report Type'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}