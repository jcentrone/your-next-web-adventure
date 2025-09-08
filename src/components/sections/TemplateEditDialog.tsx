import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOP_SECTIONS } from "@/constants/sop";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useToast } from "@/hooks/use-toast";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

interface TemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ReportTemplate | null;
  onTemplateUpdated: () => void;
  onUpdateTemplate: (templateId: string, updates: Partial<Pick<ReportTemplate, "name" | "description" | "sections_config" | "is_default">>) => Promise<void>;
}

export function TemplateEditDialog({
  open,
  onOpenChange,
  template,
  onTemplateUpdated,
  onUpdateTemplate,
}: TemplateEditDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { customSections } = useCustomSections();
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setIsDefault(template.is_default);
      setSelectedSections(template.sections_config?.map(s => s.sectionKey) || []);
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template) return;
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedSections.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one section",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const sectionsConfig = selectedSections.map((sectionKey, index) => {
        const sopSection = SOP_SECTIONS.find(s => s.key === sectionKey);
        const customSection = customSections.find(s => s.section_key === sectionKey);
        
        return {
          sectionKey,
          title: sopSection?.name || customSection?.title || sectionKey,
          isCustom: !!customSection,
          isRequired: true,
          sortOrder: index,
        };
      });

      await onUpdateTemplate(template.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        sections_config: sectionsConfig,
        is_default: isDefault,
      });
      
      onTemplateUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionToggle = (sectionKey: string, checked: boolean) => {
    if (checked) {
      setSelectedSections(prev => [...prev, sectionKey]);
    } else {
      setSelectedSections(prev => prev.filter(key => key !== sectionKey));
    }
  };

  if (!template) return null;

  const allSections = [
    ...SOP_SECTIONS.filter(s => s.key !== "report_details" && s.key !== "finalize"),
    ...customSections.filter(section => section.report_types.includes(template.report_type)),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Edit template for {template.report_type.replace("_", " ")} reports
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Home Inspection Template"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this template"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-default"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="is-default" className="text-sm">
              Set as default template for this report type
            </Label>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {allSections.map((section) => {
                  const sectionKey = "key" in section ? section.key : section.section_key;
                  const sectionName = "name" in section ? section.name : section.title;
                  const isSelected = selectedSections.includes(sectionKey);
                  
                  return (
                    <div key={sectionKey} className="flex items-center space-x-2">
                      <Checkbox
                        id={sectionKey}
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleSectionToggle(sectionKey, checked as boolean)
                        }
                      />
                      <Label htmlFor={sectionKey} className="text-sm font-normal">
                        {sectionName}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Selected {selectedSections.length} of {allSections.length} sections
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}