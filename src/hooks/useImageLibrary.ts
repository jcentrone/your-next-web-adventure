import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageItem {
  name: string;
  path: string;
  url: string;
}

const IMAGE_LIBRARY_BUCKET = "image-library";

export default function useImageLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<ImageItem[]>({
    queryKey: ["image-library", user?.id],
    queryFn: async () => {
      const folder = `${user!.id}`;
      const { data, error } = await supabase.storage
        .from(IMAGE_LIBRARY_BUCKET)
        .list(folder, { limit: 100 });
      if (error) throw error;
      const files = data || [];
      const items = await Promise.all(
        files.map(async (file) => {
          const path = `${folder}/${file.name}`;
          const { data: urlData } = await supabase.storage
            .from(IMAGE_LIBRARY_BUCKET)
            .createSignedUrl(path, 3600);
          return { name: file.name, path, url: urlData?.signedUrl || "" };
        })
      );
      return items;
    },
    enabled: !!user?.id,
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const folder = `${user!.id}`;
      const path = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const { error } = await supabase.storage
        .from(IMAGE_LIBRARY_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(error.message);
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from(IMAGE_LIBRARY_BUCKET)
        .createSignedUrl(path, 3600);
      if (urlError) throw urlError;

      return { path, url: urlData?.signedUrl || "" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image-library", user?.id] });
      toast({ title: "Image uploaded" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Failed to upload image", description: message, variant: "destructive" });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (path: string) => {
      const { error } = await supabase.storage
        .from(IMAGE_LIBRARY_BUCKET)
        .remove([path]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image-library", user?.id] });
      toast({ title: "Image deleted" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Failed to delete image", description: message, variant: "destructive" });
    },
  });

  return {
    images,
    isLoading,
    uploadImage: uploadImage.mutateAsync,
    deleteImage: deleteImage.mutateAsync,
  };
}

