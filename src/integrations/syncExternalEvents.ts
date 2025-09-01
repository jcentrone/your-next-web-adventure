import * as googleCalendar from "@/integrations/googleCalendar";
import * as outlookCalendar from "@/integrations/outlookCalendar";
import * as appleCalendar from "@/integrations/appleCalendar";

export async function syncExternalEvents(userId: string) {
  await Promise.all([
    googleCalendar.refreshEvents(userId),
    outlookCalendar.refreshEvents(userId),
    appleCalendar.refreshEvents(userId),
  ]);
}
