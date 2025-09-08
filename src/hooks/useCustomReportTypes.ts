import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { customReportTypesApi, type CustomReportType } from '@/integrations/supabase/customReportTypesApi';

export function useCustomReportTypes() {
  const [customTypes, setCustomTypes] = useState<CustomReportType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadCustomTypes = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const types = await customReportTypesApi.getCustomReportTypes(user.id);
      setCustomTypes(types);
    } catch (error) {
      console.error('Error loading custom report types:', error);
      toast({
        title: "Error",
        description: "Failed to load custom report types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomTypes();
  }, [user?.id]);

  const createCustomType = async (typeData: {
    name: string;
    description?: string;
    icon_name?: string;
    category?: string;
    organization_id?: string;
  }) => {
    if (!user?.id) return;

    try {
      const newType = await customReportTypesApi.createCustomReportType(user.id, typeData);
      await loadCustomTypes();
      toast({
        title: "Success",
        description: "Custom report type created successfully",
      });
      return newType;
    } catch (error) {
      console.error('Error creating custom report type:', error);
      toast({
        title: "Error",
        description: "Failed to create custom report type",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCustomType = async (
    typeId: string,
    updates: Partial<Pick<CustomReportType, "name" | "description" | "icon_name" | "category">>
  ) => {
    try {
      await customReportTypesApi.updateCustomReportType(typeId, updates);
      await loadCustomTypes();
      toast({
        title: "Success",
        description: "Custom report type updated successfully",
      });
    } catch (error) {
      console.error('Error updating custom report type:', error);
      toast({
        title: "Error",
        description: "Failed to update custom report type",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCustomType = async (typeId: string) => {
    try {
      await customReportTypesApi.deleteCustomReportType(typeId);
      await loadCustomTypes();
      toast({
        title: "Success",
        description: "Custom report type deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting custom report type:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom report type",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    customTypes,
    isLoading,
    loadCustomTypes,
    createCustomType,
    updateCustomType,
    deleteCustomType,
  };
}