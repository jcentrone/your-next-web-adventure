import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { customReportTypesApi, type CustomReportType } from "@/integrations/supabase/customReportTypesApi";
import { useToast } from "@/hooks/use-toast";

export const useCustomReportTypes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customTypes, setCustomTypes] = useState<CustomReportType[]>([]);

  const loadCustomTypes = async () => {
    if (!user?.id) return;

    try {
      const types = await customReportTypesApi.getUserReportTypes(user.id);
      setCustomTypes(types);
    } catch (error) {
      console.error("Error loading custom report types:", error);
      toast({
        title: "Error",
        description: "Failed to load custom report types",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadCustomTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { customTypes, loadCustomTypes };
};

