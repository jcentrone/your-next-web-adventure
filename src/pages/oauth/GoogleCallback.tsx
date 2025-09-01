import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleOAuthCallback } from "@/integrations/googleCalendar";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state) {
      handleOAuthCallback(code, state).finally(() => {
        navigate("/settings/integrations");
      });
    } else {
      navigate("/settings/integrations");
    }
  }, [navigate]);

  return null;
};

export default GoogleCallback;
