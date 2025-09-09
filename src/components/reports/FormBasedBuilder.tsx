import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, FormInput, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/lib/reportSchemas";

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "decimal" | "date" | "photo" | "signature" | "checkbox";
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface FormBasedBuilderProps {
  userId: string;
  onSaveTemplate: (templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config: Array<{
      sectionKey: string;
      title: string;
      isCustom: boolean;
      isRequired: boolean;
      sortOrder: number;
    }>;
    fields_config: Record<string, Array<{
      fieldId: string;
      fieldName: string;
      fieldLabel: string;
      widgetType: string;
      options?: string[];
      required: boolean;
      sortOrder: number;
    }>>;
  }) => Promise<void>;
}

export function FormBasedBuilder({ userId, onSaveTemplate }: FormBasedBuilderProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const reportType: Report["reportType"] = "fl_four_point_citizens";
  const [sections, setSections] = useState<FormSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const addSection = () => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: "New Section",
      description: "",
      fields: [],
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  const addField = () => {
    if (!selectedSectionId) return;
    
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${sections.find(s => s.id === selectedSectionId)?.fields.length || 0}`,
      label: "New Field",
      type: "text",
      required: false,
    };

    updateSection(selectedSectionId, {
      fields: [...(selectedSection?.fields || []), newField],
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!selectedSectionId) return;
    
    const updatedFields = selectedSection?.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ) || [];

    updateSection(selectedSectionId, { fields: updatedFields });
  };

  const deleteField = (fieldId: string) => {
    if (!selectedSectionId) return;
    
    const updatedFields = selectedSection?.fields.filter(f => f.id !== fieldId) || [];
    updateSection(selectedSectionId, { fields: updatedFields });
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    if (sections.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one section",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Build sections config
      const sectionsConfig = sections.map((section, index) => ({
        sectionKey: section.id,
        title: section.title,
        isCustom: true,
        isRequired: true,
        sortOrder: index + 1,
      }));

      // Build fields config
      const fieldsConfig: Record<string, any[]> = {};
      
      sections.forEach(section => {
        if (section.fields.length > 0) {
          fieldsConfig[section.id] = section.fields.map((field, index) => ({
            fieldId: field.id,
            fieldName: field.name,
            fieldLabel: field.label,
            widgetType: field.type,
            options: field.options,
            required: field.required,
            sortOrder: index,
          }));
        }
      });

      await onSaveTemplate({
        name: templateName,
        description: templateDescription || undefined,
        report_type: reportType,
        sections_config: sectionsConfig,
        fields_config: fieldsConfig,
      });

      toast({
        title: "Success",
        description: "Form-based report template created successfully",
      });

      // Reset form
      setTemplateName("");
      setTemplateDescription("");
      setSections([]);
      setSelectedSectionId(null);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FormInput className="w-5 h-5" />
            Form-Based Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe this template..."
              rows={2}
            />
          </div>
          <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Form-Based Report Features</h4>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Structured data collection with custom fields</li>
                  <li>• Multiple input types: text, dropdowns, dates, photos</li>
                  <li>• Flexible section organization</li>
                  <li>• Validation and required field support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Builder */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sections List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sections</CardTitle>
              <Button onClick={addSection} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map(section => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedSectionId === section.id 
                      ? "bg-primary/10 border-primary" 
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{section.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {section.fields.length}
                    </Badge>
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sections yet. Click + to add one.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section Editor */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSection ? `Edit: ${selectedSection.title}` : "Select a Section"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSection ? (
              <div className="space-y-6">
                {/* Section Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Section Details</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSection(selectedSection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label>Section Title</Label>
                      <Input
                        value={selectedSection.title}
                        onChange={(e) => updateSection(selectedSection.id, { title: e.target.value })}
                        placeholder="Section title"
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea
                        value={selectedSection.description || ""}
                        onChange={(e) => updateSection(selectedSection.id, { description: e.target.value })}
                        placeholder="Section description"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Fields</h4>
                    <Button onClick={addField} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedSection.fields.map(field => (
                      <Card key={field.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">Field Configuration</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteField(field.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Field Name</Label>
                              <Input
                                value={field.name}
                                onChange={(e) => updateField(field.id, { name: e.target.value })}
                                placeholder="field_name"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Display Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Field Label"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Field Type</Label>
                              <Select value={field.type} onValueChange={(value) => updateField(field.id, { type: value as FormField["type"] })}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text Input</SelectItem>
                                  <SelectItem value="textarea">Text Area</SelectItem>
                                  <SelectItem value="select">Select Dropdown</SelectItem>
                                  <SelectItem value="multiselect">Multi Select</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="decimal">Decimal</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="photo">Photo Upload</SelectItem>
                                  <SelectItem value="signature">Signature</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="rounded"
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                          </div>
                          {(field.type === "select" || field.type === "multiselect") && (
                            <div>
                              <Label className="text-xs">Options (one per line)</Label>
                              <Textarea
                                value={field.options?.join("\n") || ""}
                                onChange={(e) => updateField(field.id, { 
                                  options: e.target.value.split("\n").filter(opt => opt.trim()) 
                                })}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    {selectedSection.fields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No fields in this section. Click "Add Field" to get started.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FormInput className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a section from the left to configure its fields</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Template */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveTemplate} 
          disabled={!templateName.trim() || sections.length === 0 || isSaving}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </div>
  );
}