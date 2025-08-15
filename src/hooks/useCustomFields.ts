import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { customFieldsApi, type CustomField } from "@/integrations/supabase/customFieldsApi";
import { useToast } from "@/hooks/use-toast";

export const useCustomFields = (sectionKey?: string) => {
  const { user } = useAuth();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadCustomFields = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const fields = await customFieldsApi.getUserCustomFields(user.id, sectionKey);
      setCustomFields(fields);
    } catch (error) {
      console.error("Error loading custom fields:", error);
      toast({
        title: "Error",
        description: "Failed to load custom fields",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomFields();
  }, [user?.id, sectionKey]);

  const createField = async (fieldData: {
    section_key: string;
    field_name: string;
    field_label: string;
    widget_type: CustomField["widget_type"];
    options?: string[];
    required?: boolean;
  }) => {
    if (!user?.id) return;

    try {
      await customFieldsApi.createCustomField(user.id, fieldData);
      await loadCustomFields();
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
    } catch (error) {
      console.error("Error creating custom field:", error);
      toast({
        title: "Error",
        description: "Failed to create custom field",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateField = async (
    fieldId: string,
    updates: Partial<Pick<CustomField, "field_label" | "widget_type" | "options" | "required" | "sort_order">>
  ) => {
    try {
      await customFieldsApi.updateCustomField(fieldId, updates);
      await loadCustomFields();
      toast({
        title: "Success",
        description: "Custom field updated successfully",
      });
    } catch (error) {
      console.error("Error updating custom field:", error);
      toast({
        title: "Error",
        description: "Failed to update custom field",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      await customFieldsApi.deleteCustomField(fieldId);
      await loadCustomFields();
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast({
        title: "Error",
        description: "Failed to delete custom field",
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderFields = async (fieldIds: string[]) => {
    if (!user?.id || !sectionKey) return;

    try {
      await customFieldsApi.reorderCustomFields(user.id, sectionKey, fieldIds);
      await loadCustomFields();
    } catch (error) {
      console.error("Error reordering custom fields:", error);
      toast({
        title: "Error",
        description: "Failed to reorder custom fields",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    customFields,
    isLoading,
    loadCustomFields,
    createField,
    updateField,
    deleteField,
    reorderFields,
  };
};