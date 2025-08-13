import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionKey } from "@/constants/sop";

type SectionGuidance = {
  items: string[];
  infoFields: string[];
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
          .from('section_guidance')
          .select('section_key, items, info_fields'); // <-- add info_fields column here

        if (error) throw error;

        const guidanceMap: Record<SectionKey, SectionGuidance> = {} as Record<SectionKey, SectionGuidance>;
        
        if (data) {
          data.forEach((item: any) => {
            guidanceMap[item.section_key as SectionKey] = {
              items: item.items || [],
              infoFields: item.info_fields || [], // <-- store infoFields too
            };
          });
        }

        setGuidance(guidanceMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching section guidance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch guidance');

        // Fallback to local constants if Supabase fails
        const { SOP_GUIDANCE } = await import("@/constants/sopGuidance");
        setGuidance(SOP_GUIDANCE as any);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, []);

  return { guidance, loading, error };
}
