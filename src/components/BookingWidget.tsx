import React from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi, type BookingSettings } from "@/integrations/supabase/bookingApi";
import Widget from "./booking/Widget";

export type BookingService = "calendly" | "acuity" | "setmore" | "internal";

interface BookingWidgetProps {
  service: BookingService;
  link: string;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ service, link }) => {
  const { data: settings } = useQuery<BookingSettings | null>({
    queryKey: ["booking-settings", link],
    queryFn: () => bookingApi.getSettingsBySlug(link),
    enabled: service === "internal" && !!link,
  });

  const { data: taken = [] } = useQuery({
    queryKey: ["booking-taken", settings?.user_id],
    queryFn: () => bookingApi.getTakenAppointments(settings!.user_id),
    enabled: service === "internal" && !!settings?.user_id,
  });

  const reservedRanges = React.useMemo(
    () =>
      taken.map((a: { appointment_date: string; duration_minutes: number | null }) => {
        const start = new Date(a.appointment_date);
        const end = new Date(start.getTime() + (a.duration_minutes ?? 0) * 60000);
        return { startDate: start, endDate: end };
      }),
    [taken]
  );

  if (!link) return null;

  const iframeProps = {
    className: "w-full min-h-[700px] border-none",
    allowFullScreen: true,
  } as const;

  switch (service) {
    case "internal":
      if (!settings) return null;
      return <Widget settings={settings} reserved={reservedRanges} />;
    case "calendly":
      return (
        <iframe
          {...iframeProps}
          src={`${link}${link.includes("?") ? "&" : "?"}embed_domain=${
            typeof window !== "undefined" ? window.location.hostname : ""
          }&embed_type=Inline`}
        />
      );
    case "acuity":
    case "setmore":
      return <iframe {...iframeProps} src={link} />;
    default:
      return null;
  }
};

export default BookingWidget;

