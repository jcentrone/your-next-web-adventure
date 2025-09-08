import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Edit, Trash2, Star } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

interface TemplatesListProps {
  templates: ReportTemplate[];
  selectedTemplate: ReportTemplate | null;
  onTemplateSelect: (template: ReportTemplate) => void;
  onCreateTemplate: () => void;
  onEditTemplate: (template: ReportTemplate) => void;
  onDuplicateTemplate: (template: ReportTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  isLoading?: boolean;
}

export function TemplatesList({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onCreateTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  isLoading = false,
}: TemplatesListProps) {
  const [deleteTemplateId, setDeleteTemplateId] = React.useState<string | null>(null);

  const handleDelete = (templateId: string) => {
    onDeleteTemplate(templateId);
    setDeleteTemplateId(null);
  };

  return (
    <>
      <div className="w-80 bg-muted/30 border-r border-border h-full overflow-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Templates</h3>
            <Button
              onClick={onCreateTemplate}
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">New</span>
            </Button>
          </div>
        </div>

        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No templates yet</p>
              <p className="text-xs mt-1">Create your first template to get started</p>
            </div>
          ) : (
            templates.map(template => {
              const isSelected = selectedTemplate?.id === template.id;
              
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    isSelected 
                      ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                      : "bg-background"
                  }`}
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                          {template.name}
                          {template.is_default && (
                            <Star className="h-3 w-3 fill-primary text-primary" />
                          )}
                        </CardTitle>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {template.sections_config.length} sections
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTemplate(template);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateTemplate(template);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!template.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTemplateId(template.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplateId && handleDelete(deleteTemplateId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}