import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionKey } from "@/constants/sop";

export function useSectionGuidance() {
  const [guidance, setGuidance] = useState<Record<SectionKey, string[]>>({} as Record<SectionKey, string[]>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('section_guidance')
          .select('section_key, items');

        if (error) {
          throw error;
        }

        // Transform the data into the expected format
        const guidanceMap: Record<SectionKey, string[]> = {} as Record<SectionKey, string[]>;
        
        if (data) {
          data.forEach((item: any) => {
            guidanceMap[item.section_key as SectionKey] = item.items || [];
          });
        }

        setGuidance(guidanceMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching section guidance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch guidance');
        
        // Fallback to local constants if Supabase fails
        const { SOP_GUIDANCE } = await import("@/constants/sopGuidance");
        setGuidance(SOP_GUIDANCE);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, []);

  return { guidance, loading, error };
}