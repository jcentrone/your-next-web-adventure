import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as appleCalendar from "@/integrations/appleCalendar";

const AppleCallback = () => {
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
        const res = await fetch("https://appleid.apple.com/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: import.meta.env.VITE_APPLE_CLIENT_ID || "",
            client_secret: import.meta.env.VITE_APPLE_CLIENT_SECRET || "",
            redirect_uri: `${window.location.origin}/oauth/apple`,
            grant_type: "authorization_code",
          }),
        });
        if (res.ok) {
          const token = await res.json();
          await appleCalendar.handleOAuthCallback(state, token);
          queryClient.invalidateQueries({
            queryKey: ["apple-calendar-connected", state],
          });
        }
      } finally {
        navigate("/settings/integrations");
      }
    })();
  }, [navigate, queryClient]);

  return null;
};

export default AppleCallback;
