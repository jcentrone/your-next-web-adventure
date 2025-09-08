import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOP_SECTIONS } from "@/constants/sop";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

interface TemplateCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: Report["reportType"];
  onTemplateCreated: () => void;
  onCreateTemplate: (templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config: ReportTemplate["sections_config"];
  }) => Promise<void>;
}

export function TemplateCreateDialog({
  open,
  onOpenChange,
  reportType,
  onTemplateCreated,
  onCreateTemplate,
}: TemplateCreateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>(
    SOP_SECTIONS.filter(s => s.key !== "report_details" && s.key !== "finalize").map(s => s.key)
  );
  const [isLoading, setIsLoading] = useState(false);
  const { customSections } = useCustomSections();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      await onCreateTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        report_type: reportType,
        sections_config: sectionsConfig,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setSelectedSections(SOP_SECTIONS.filter(s => s.key !== "report_details" && s.key !== "finalize").map(s => s.key));
      
      onTemplateCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating template:", error);
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

  const allSections = [
    ...SOP_SECTIONS.filter(s => s.key !== "report_details" && s.key !== "finalize"),
    ...customSections.filter(section => section.report_types.includes(reportType)),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a new template for {reportType.replace("_", " ")} reports
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
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}