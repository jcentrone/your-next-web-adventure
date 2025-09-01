import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import * as googleCalendar from "@/integrations/googleCalendar";
import * as outlookCalendar from "@/integrations/outlookCalendar";
import * as appleCalendar from "@/integrations/appleCalendar";

const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [optimizeRoute, setOptimizeRoute] = useState(
    () => localStorage.getItem("optimizeRoute") === "true"
  );

  const { data: googleConnected, refetch: refetchGoogle } = useQuery({
    queryKey: ["google-calendar-connected", user?.id],
    queryFn: () => googleCalendar.isConnected(user!.id),
    enabled: !!user,
  });

  const { data: outlookConnected, refetch: refetchOutlook } = useQuery({
    queryKey: ["outlook-calendar-connected", user?.id],
    queryFn: () => outlookCalendar.isConnected(user!.id),
    enabled: !!user,
  });

  const { data: appleConnected, refetch: refetchApple } = useQuery({
    queryKey: ["apple-calendar-connected", user?.id],
    queryFn: () => appleCalendar.isConnected(user!.id),
    enabled: !!user,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Integrations</h2>
      <p className="text-sm text-muted-foreground">
        Manage your third-party integrations here.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <p className="font-medium">Route Optimization</p>
            <p className="text-sm text-muted-foreground">
              Enable optimized navigation when viewing daily appointments.
            </p>
          </div>
          <Switch
            checked={optimizeRoute}
            onCheckedChange={(checked) => {
              setOptimizeRoute(checked);
              localStorage.setItem("optimizeRoute", String(checked));
            }}
          />
        </div>

        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <p className="font-medium">Google Calendar</p>
            <p className="text-sm text-muted-foreground">
              {googleConnected ? "Connected" : "Not connected"}
            </p>
          </div>
          {googleConnected ? (
            <Button
              variant="outline"
              onClick={async () => {
                await googleCalendar.disconnect(user!.id);
                refetchGoogle();
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button onClick={() => googleCalendar.connect(user!.id)}>
              Connect
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <p className="font-medium">Outlook Calendar</p>
            <p className="text-sm text-muted-foreground">
              {outlookConnected ? "Connected" : "Not connected"}
            </p>
          </div>
          {outlookConnected ? (
            <Button
              variant="outline"
              onClick={async () => {
                await outlookCalendar.disconnect(user!.id);
                refetchOutlook();
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button onClick={() => outlookCalendar.connect(user!.id)}>
              Connect
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between border p-4 rounded-md">
          <div>
            <p className="font-medium">Apple Calendar</p>
            <p className="text-sm text-muted-foreground">
              {appleConnected ? "Connected" : "Not connected"}
            </p>
          </div>
          {appleConnected ? (
            <Button
              variant="outline"
              onClick={async () => {
                await appleCalendar.disconnect(user!.id);
                refetchApple();
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button onClick={() => appleCalendar.connect(user!.id)}>
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
