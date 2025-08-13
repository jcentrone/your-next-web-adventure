// hooks/useSectionGuidance.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionKey } from "@/constants/sop";

export type InfoField = {
  name: string;
  label: string;
  sop_ref?: string;
  widget: "text" | "select" | "textarea";
  required?: boolean;
  options?: string[];
};

export type SectionGuidance = {
  infoFields: string[] | InfoField[];
  observationItems: string[];
};

export function useSectionGuidance() {
  const [guidance, setGuidance] = useState<Record<SectionKey, SectionGuidance>>({} as Record<SectionKey, SectionGuidance>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("section_guidance")
          .select("section_key, infoFields, items"); // <-- make sure your DB has these columns

        if (error) throw error;

        const guidanceMap: Record<SectionKey, SectionGuidance> = {} as Record<SectionKey, SectionGuidance>;

        if (data) {
          data.forEach((item: any) => {
            guidanceMap[item.section_key as SectionKey] = {
              infoFields: item.infoFields || [],
              observationItems: item.items || []
            };
          });
        }

        setGuidance(guidanceMap);
        setError(null);
      } catch (err) {
        console.error("Error fetching section guidance:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch guidance");

        // fallback to local constants
        const { SOP_GUIDANCE } = await import("@/constants/sopGuidance");
        const fallbackMap: Record<SectionKey, SectionGuidance> = {} as Record<SectionKey, SectionGuidance>;

        Object.entries(SOP_GUIDANCE).forEach(([key, items]) => {
          fallbackMap[key as SectionKey] = {
            infoFields: [], // default empty since local file might not have this
            observationItems: items
          };
        });

        setGuidance(fallbackMap);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, []);

  return { guidance, loading, error };
}
