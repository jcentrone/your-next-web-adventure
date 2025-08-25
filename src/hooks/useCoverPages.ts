import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  coverPagesApi,
  type CoverPage,
} from "@/integrations/supabase/coverPagesApi";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface CreateCoverPagePayload {
  name: string;
  template_slug?: string | null;
  color_palette_key?: string | null;
  text_content?: Json;
  design_json?: Json;
  image_url?: string | null;
  report_types?: string[];
}

export const useCoverPages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: coverPages = [],
    isLoading: isLoadingCoverPages,
  } = useQuery<CoverPage[]>({
    queryKey: ["cover-pages", user?.id],
    queryFn: () => coverPagesApi.getCoverPages(user!.id),
    enabled: !!user?.id,
  });

  const createCoverPage = useMutation({
    mutationFn: (payload: CreateCoverPagePayload) =>
      coverPagesApi.createCoverPage(user!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-pages", user?.id] });
      toast({ title: "Cover page created" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to create cover page",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateCoverPage = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CoverPage> }) =>
      coverPagesApi.updateCoverPage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-pages", user?.id] });
      toast({ title: "Cover page updated" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to update cover page",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteCoverPage = useMutation({
    mutationFn: (id: string) => coverPagesApi.deleteCoverPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-pages", user?.id] });
      toast({ title: "Cover page deleted" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to delete cover page",
        description: message,
        variant: "destructive",
      });
    },
  });

  const assignments = useMemo(() => {
    const map: Record<string, string> = {};
    coverPages.forEach((cp) => {
      (cp.report_types || []).forEach((rt) => {
        map[rt] = cp.id;
      });
    });
    return map;
  }, [coverPages]);

  const assignCoverPageToReportType = async (
    reportType: string,
    coverPageId: string,
  ) => {
    try {
      // Remove reportType from any other cover page
      for (const cp of coverPages) {
        if (cp.id !== coverPageId && (cp.report_types || []).includes(reportType)) {
          const updated = (cp.report_types || []).filter((rt) => rt !== reportType);
          await coverPagesApi.updateCoverPage(cp.id, { report_types: updated });
        }
      }

      const target = coverPages.find((cp) => cp.id === coverPageId);
      const updatedReportTypes = Array.from(
        new Set([...(target?.report_types || []), reportType]),
      );
      await coverPagesApi.updateCoverPage(coverPageId, {
        report_types: updatedReportTypes,
      });
      queryClient.invalidateQueries({ queryKey: ["cover-pages", user?.id] });
      toast({ title: "Cover page assigned" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to assign cover page",
        description: message,
        variant: "destructive",
      });
    }
  };

  const removeAssignmentFromReportType = async (reportType: string) => {
    try {
      const cp = coverPages.find((c) => (c.report_types || []).includes(reportType));
      if (cp) {
        const updated = (cp.report_types || []).filter((rt) => rt !== reportType);
        await coverPagesApi.updateCoverPage(cp.id, { report_types: updated });
        queryClient.invalidateQueries({ queryKey: ["cover-pages", user?.id] });
        toast({ title: "Assignment removed" });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to remove assignment",
        description: message,
        variant: "destructive",
      });
    }
  };

  return {
    coverPages,
    assignments,
    isLoadingCoverPages,
    createCoverPage: createCoverPage.mutateAsync,
    updateCoverPage: updateCoverPage.mutateAsync,
    deleteCoverPage: deleteCoverPage.mutateAsync,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
  };
};

export default useCoverPages;

