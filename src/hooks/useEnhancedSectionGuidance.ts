import { useState, useEffect } from "react";
import { SectionKey } from "@/constants/sop";
import { useSectionGuidance, type InfoField, type SectionGuidance } from "./useSectionGuidance";
import { useCustomSections } from "./useCustomSections";
import { useCustomFields } from "./useCustomFields";

export type EnhancedSectionGuidance = SectionGuidance & {
  isCustomSection?: boolean;
  sectionTitle?: string;
};

export function useEnhancedSectionGuidance() {
  const { guidance: standardGuidance, loading: standardLoading, error: standardError } = useSectionGuidance();
  const { customSections, isLoading: customSectionsLoading } = useCustomSections();
  const { customFields, isLoading: customFieldsLoading } = useCustomFields();
  
  const [enhancedGuidance, setEnhancedGuidance] = useState<Record<string, EnhancedSectionGuidance>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (standardLoading || customSectionsLoading || customFieldsLoading) {
      setLoading(true);
      return;
    }

    const enhanced: Record<string, EnhancedSectionGuidance> = {};

    // Add standard SOP sections with their guidance
    Object.entries(standardGuidance).forEach(([key, guidance]) => {
      enhanced[key] = {
        ...guidance,
        isCustomSection: false,
      };
    });

    // Add custom sections
    customSections.forEach((section) => {
      enhanced[section.section_key] = {
        infoFields: [],
        observationItems: [],
        isCustomSection: true,
        sectionTitle: section.title,
      };
    });

    // Merge custom fields into the appropriate sections
    customFields.forEach((field) => {
      if (!enhanced[field.section_key]) {
        enhanced[field.section_key] = {
          infoFields: [],
          observationItems: [],
          isCustomSection: false,
        };
      }

      const infoField: InfoField = {
        name: field.field_name,
        label: field.field_label,
        widget: field.widget_type as "text" | "select" | "textarea" | "date" | "contact_lookup" | "multiselect",
        required: field.required,
        options: field.options,
      };

      // Ensure infoFields is an array of InfoField objects
      if (Array.isArray(enhanced[field.section_key].infoFields)) {
        const currentFields = enhanced[field.section_key].infoFields as InfoField[];
        enhanced[field.section_key].infoFields = [...currentFields, infoField];
      } else {
        // Convert string array to InfoField array if needed
        const stringFields = enhanced[field.section_key].infoFields as string[];
        enhanced[field.section_key].infoFields = [
          ...stringFields.map(str => ({ name: str, label: str, widget: 'text' as const })),
          infoField
        ];
      }
    });

    setEnhancedGuidance(enhanced);
    setLoading(false);
  }, [standardGuidance, customSections, customFields, standardLoading, customSectionsLoading, customFieldsLoading]);

  return {
    guidance: enhancedGuidance,
    loading,
    error: standardError,
  };
}