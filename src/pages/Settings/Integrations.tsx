import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Navigation, 
  Calendar, 
  CalendarDays,
  Apple,
  Clock,
  ExternalLink
} from "lucide-react";
import * as googleCalendar from "@/integrations/googleCalendar";
import * as outlookCalendar from "@/integrations/outlookCalendar";
import * as appleCalendar from "@/integrations/appleCalendar";

const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [optimizeRoute, setOptimizeRoute] = useState(
    () => localStorage.getItem("optimizeRoute") === "true"
  );

  const [calendlyLink, setCalendlyLink] = useState(
    () => localStorage.getItem("calendlyLink") || ""
  );
  const [acuityLink, setAcuityLink] = useState(
    () => localStorage.getItem("acuityLink") || ""
  );
  const [setmoreLink, setSetmoreLink] = useState(
    () => localStorage.getItem("setmoreLink") || ""
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

      <div className="space-y-6">
        {/* Navigation & Maps */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <h3 className="text-base font-medium">Navigation & Maps</h3>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between border p-4 rounded-md">
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Route Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Enable optimized navigation when viewing daily appointments.
                  </p>
                </div>
              </div>
              <Switch
                checked={optimizeRoute}
                onCheckedChange={(checked) => {
                  setOptimizeRoute(checked);
                  localStorage.setItem("optimizeRoute", String(checked));
                }}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Calendar Sync */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-base font-medium">Calendar Sync</h3>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between border p-4 rounded-md">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 dark:bg-blue-950">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">G</span>
                </div>
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    {googleConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
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
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 dark:bg-blue-950">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">O</span>
                </div>
                <div>
                  <p className="font-medium">Outlook Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    {outlookConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
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
              <div className="flex items-center gap-3">
                <Apple className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Apple Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    {appleConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
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

        <Separator />

        {/* Scheduling Platforms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="text-base font-medium">Scheduling Platforms</h3>
          </div>
          <div className="grid gap-3">
            <div className="flex items-start justify-between border p-4 rounded-md">
              <div className="flex items-start gap-3 flex-1 mr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 dark:bg-blue-950 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">C</span>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="font-medium">Calendly</p>
                  <p className="text-sm text-muted-foreground">
                    Paste your scheduling link for client bookings.
                  </p>
                  <Label htmlFor="calendly-link" className="sr-only">
                    Calendly Link
                  </Label>
                  <Input
                    id="calendly-link"
                    placeholder="https://calendly.com/your-name/meeting"
                    value={calendlyLink}
                    onChange={(e) => setCalendlyLink(e.target.value)}
                    onBlur={() => localStorage.setItem("calendlyLink", calendlyLink)}
                  />
                  {calendlyLink && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Share this link with clients: {calendlyLink}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => localStorage.setItem("calendlyLink", calendlyLink)}
              >
                Save
              </Button>
            </div>

            <div className="flex items-start justify-between border p-4 rounded-md">
              <div className="flex items-start gap-3 flex-1 mr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-50 dark:bg-orange-950 mt-0.5">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">A</span>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="font-medium">Acuity Scheduling</p>
                  <p className="text-sm text-muted-foreground">
                    Enter your scheduling link or API key.
                  </p>
                  <Label htmlFor="acuity-link" className="sr-only">
                    Acuity Link
                  </Label>
                  <Input
                    id="acuity-link"
                    placeholder="https://app.acuityscheduling.com/schedule.php?owner=123456"
                    value={acuityLink}
                    onChange={(e) => setAcuityLink(e.target.value)}
                    onBlur={() => localStorage.setItem("acuityLink", acuityLink)}
                  />
                  {acuityLink && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Share this link with clients: {acuityLink}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => localStorage.setItem("acuityLink", acuityLink)}
              >
                Save
              </Button>
            </div>

            <div className="flex items-start justify-between border p-4 rounded-md">
              <div className="flex items-start gap-3 flex-1 mr-4">
                <Clock className="h-8 w-8 text-muted-foreground mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-medium">Setmore</p>
                  <p className="text-sm text-muted-foreground">
                    Provide your booking page link for clients to schedule.
                  </p>
                  <Label htmlFor="setmore-link" className="sr-only">
                    Setmore Link
                  </Label>
                  <Input
                    id="setmore-link"
                    placeholder="https://booking.setmore.com/schedule/yourbusiness"
                    value={setmoreLink}
                    onChange={(e) => setSetmoreLink(e.target.value)}
                    onBlur={() => localStorage.setItem("setmoreLink", setmoreLink)}
                  />
                  {setmoreLink && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Share this link with clients: {setmoreLink}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => localStorage.setItem("setmoreLink", setmoreLink)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
