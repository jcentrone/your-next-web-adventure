import React from "react";

export type BookingService = "calendly" | "acuity" | "setmore" | "internal";

interface BookingWidgetProps {
  service: BookingService;
  link: string;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ service, link }) => {
  if (!link) return null;

  const iframeProps = {
    className: "w-full min-h-[700px] border-none",
    allowFullScreen: true,
  } as const;

  switch (service) {
    case "internal":
      return <iframe {...iframeProps} src={`/book/${link}?embed=1`} />;
    case "calendly":
      return (
        <iframe
          {...iframeProps}
          src={`${link}${link.includes("?" ) ? "&" : "?"}embed_domain=${typeof window !== "undefined" ? window.location.hostname : ""}&embed_type=Inline`}
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
