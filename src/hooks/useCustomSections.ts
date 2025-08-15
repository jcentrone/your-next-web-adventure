import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { customSectionsApi, type CustomSection } from "@/integrations/supabase/customSectionsApi";
import { useToast } from "@/hooks/use-toast";

export const useCustomSections = () => {
  const { user } = useAuth();
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadCustomSections = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const sections = await customSectionsApi.getUserCustomSections(user.id);
      setCustomSections(sections);
    } catch (error) {
      console.error("Error loading custom sections:", error);
      toast({
        title: "Error",
        description: "Failed to load custom sections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomSections();
  }, [user?.id]);

  const createSection = async (title: string) => {
    if (!user?.id) return;

    try {
      await customSectionsApi.createCustomSection(
        user.id,
        title,
        undefined // organization_id - can be enhanced later
      );
      await loadCustomSections();
    } catch (error) {
      console.error("Error creating custom section:", error);
      throw error;
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<Pick<CustomSection, "title" | "sort_order">>) => {
    try {
      await customSectionsApi.updateCustomSection(sectionId, updates);
      await loadCustomSections();
    } catch (error) {
      console.error("Error updating custom section:", error);
      throw error;
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      await customSectionsApi.deleteCustomSection(sectionId);
      await loadCustomSections();
    } catch (error) {
      console.error("Error deleting custom section:", error);
      throw error;
    }
  };

  return {
    customSections,
    isLoading,
    loadCustomSections,
    createSection,
    updateSection,
    deleteSection,
  };
};