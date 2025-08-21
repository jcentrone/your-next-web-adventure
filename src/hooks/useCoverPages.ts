import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  coverPagesApi,
  type CoverPage,
  type CoverPageAssignment,
} from "@/integrations/supabase/coverPagesApi";
import { useToast } from "@/hooks/use-toast";

interface CreateCoverPagePayload {
  name: string;
  template_slug?: string | null;
  color_palette_key?: string | null;
  text_content?: unknown;
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
    data: assignments = [],
    isLoading: isLoadingAssignments,
  } = useQuery<CoverPageAssignment[]>({
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

  const createAssignment = useMutation({
    mutationFn: ({
      reportType,
      coverPageId,
    }: {
      reportType: string;
      coverPageId: string;
    }) => coverPagesApi.createCoverPageAssignment(user!.id, reportType, coverPageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cover-page-assignments", user?.id],
      });
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

  const updateAssignment = useMutation({
    mutationFn: ({
      id,
      reportType,
      coverPageId,
    }: {
      id: string;
      reportType?: string;
      coverPageId?: string;
    }) =>
      coverPagesApi.updateCoverPageAssignment(id, {
        report_type: reportType,
        cover_page_id: coverPageId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cover-page-assignments", user?.id],
      });
      toast({ title: "Assignment updated" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Failed to update assignment",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteAssignment = useMutation({
    mutationFn: (id: string) => coverPagesApi.deleteCoverPageAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cover-page-assignments", user?.id],
      });
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
    const existing = assignments.find((a) => a.report_type === reportType);
    if (existing) {
      await updateAssignment.mutateAsync({ id: existing.id, coverPageId });
    } else {
      await createAssignment.mutateAsync({ reportType, coverPageId });
    }
  };

  const removeAssignmentFromReportType = async (reportType: string) => {
    const existing = assignments.find((a) => a.report_type === reportType);
    if (existing) {
      await deleteAssignment.mutateAsync(existing.id);
    }
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

