import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reportTemplatesApi, type ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/lib/reportSchemas";

export const useReportTemplates = (reportType?: Report["reportType"]) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadTemplates = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await reportTemplatesApi.getUserReportTemplates(user.id, reportType);
      setTemplates(data);
    } catch (error) {
      console.error("Error loading report templates:", error);
      toast({
        title: "Error",
        description: "Failed to load report templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [user?.id, reportType]);

  const createTemplate = async (templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config?: ReportTemplate["sections_config"];
    fields_config?: ReportTemplate["fields_config"];
  }) => {
    if (!user?.id) return;

    try {
      await reportTemplatesApi.createReportTemplate(user.id, templateData);
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (
    templateId: string,
    updates: Partial<Pick<ReportTemplate, "name" | "description" | "sections_config" | "fields_config" | "is_default">>
  ) => {
    try {
      await reportTemplatesApi.updateReportTemplate(templateId, updates);
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await reportTemplatesApi.deleteReportTemplate(templateId);
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateTemplate = async (templateId: string, newName: string) => {
    if (!user?.id) return;

    try {
      await reportTemplatesApi.duplicateReportTemplate(templateId, newName, user.id);
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    templates,
    isLoading,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
};