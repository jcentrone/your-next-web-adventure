import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  text_content?: unknown;
  design_json?: Json;
  image_url?: string | null;
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

  const {
    data: assignments = {},
    isLoading: isLoadingAssignments,
  } = useQuery<Record<string, string>>({
    queryKey: ["cover-page-assignments", user?.id],
    queryFn: () => coverPagesApi.getCoverPageAssignments(user!.id),
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

  const setAssignment = useMutation({
    mutationFn: ({
      reportType,
      coverPageId,
    }: {
      reportType: string;
      coverPageId: string;
    }) => coverPagesApi.setCoverPageAssignment(user!.id, reportType, coverPageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-page-assignments", user?.id] });
      toast({ title: "Cover page assigned" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to assign cover page",
        description: message,
        variant: "destructive",
      });
    },
  });

  const clearAssignment = useMutation({
    mutationFn: (reportType: string) =>
      coverPagesApi.clearCoverPageAssignment(user!.id, reportType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-page-assignments", user?.id] });
      toast({ title: "Assignment removed" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to remove assignment",
        description: message,
        variant: "destructive",
      });
    },
  });

  const assignCoverPageToReportType = async (
    reportType: string,
    coverPageId: string,
  ) => {
    await setAssignment.mutateAsync({ reportType, coverPageId });
  };

  const removeAssignmentFromReportType = async (reportType: string) => {
    await clearAssignment.mutateAsync(reportType);
  };

  return {
    coverPages,
    assignments,
    isLoadingCoverPages,
    isLoadingAssignments,
    createCoverPage: createCoverPage.mutateAsync,
    updateCoverPage: updateCoverPage.mutateAsync,
    deleteCoverPage: deleteCoverPage.mutateAsync,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
  };
};

export default useCoverPages;

