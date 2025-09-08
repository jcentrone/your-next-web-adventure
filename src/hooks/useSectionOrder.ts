import { useState, useEffect } from "react";
import { getUserSectionOrder, updateUserSectionOrder, type UserSectionOrder } from "@/integrations/supabase/sectionOrderApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getSectionsForReportType } from "@/constants/reportSections";
import type { Report } from "@/lib/reportSchemas";
import type { CustomSection } from "@/integrations/supabase/customSectionsApi";

export function useSectionOrder(reportType: Report["reportType"], customSections: CustomSection[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sectionOrder, setSectionOrder] = useState<UserSectionOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSectionOrder();
    }
  }, [user?.id, reportType]);

  const loadSectionOrder = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const order = await getUserSectionOrder(user.id, reportType);
      setSectionOrder(order);
    } catch (error) {
      console.error('Error loading section order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSectionOrder = async (sections: Array<{key: string, type: 'standard' | 'custom', sortOrder: number}>) => {
    if (!user?.id) return;

    try {
      await updateUserSectionOrder(user.id, reportType, sections);
      await loadSectionOrder(); // Reload to get updated data
      toast({
        title: "Success",
        description: "Section order updated successfully",
      });
    } catch (error) {
      console.error('Error updating section order:', error);
      toast({
        title: "Error",
        description: "Failed to update section order",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get ordered sections combining standard sections, custom sections, and user preferences
  const getOrderedSections = () => {
    const standardSections = getSectionsForReportType(reportType);
    const relevantCustomSections = customSections.filter(section =>
      section.report_types.includes(reportType)
    );

    // If no custom order exists, use default ordering
    if (sectionOrder.length === 0) {
      return [
        ...standardSections.map((section, index) => ({
          ...section,
          type: 'standard' as const,
          id: section.key,
          sortOrder: index
        })),
        ...relevantCustomSections.map((section, index) => ({
          ...section,
          type: 'custom' as const,
          name: section.title,
          key: section.section_key,
          id: section.section_key,
          sortOrder: standardSections.length + index
        }))
      ].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    // Create a map for quick lookup of custom order
    const orderMap = new Map(sectionOrder.map(order => [order.section_key, order.sort_order]));

    // Combine all sections and apply custom ordering
    const allSections = [
      ...standardSections.map(section => ({
        ...section,
        type: 'standard' as const,
        id: section.key,
        sortOrder: orderMap.get(section.key) ?? 999 // Default high value if not in custom order
      })),
      ...relevantCustomSections.map(section => ({
        ...section,
        type: 'custom' as const,
        name: section.title,
        key: section.section_key,
        id: section.section_key,
        sortOrder: orderMap.get(section.section_key) ?? 999
      }))
    ];

    return allSections.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  return {
    sectionOrder,
    loading,
    updateSectionOrder,
    getOrderedSections
  };
}