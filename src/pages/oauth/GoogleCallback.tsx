import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as googleCalendar from "@/integrations/googleCalendar";
import { supabase } from "@/integrations/supabase/client";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state) {
      navigate("/settings/integrations");
      return;
    }

    (async () => {
      try {
        // Use Supabase edge function for secure OAuth token exchange
        const { data: tokenData, error } = await supabase.functions.invoke('oauth-token-exchange', {
          body: {
            provider: 'google',
            code,
            state,
            redirect_uri: `${window.location.origin}/oauth/google`
          }
        });
        
        if (error) throw error;
        await googleCalendar.handleOAuthCallback(state, tokenData);
        queryClient.invalidateQueries({
          queryKey: ["google-calendar-connected", state],
        });
      } finally {
        navigate("/settings/integrations");
      }
    })();
  }, [navigate, queryClient]);

  return null;
};

export default GoogleCallback;
