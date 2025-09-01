import React from "react";

export type BookingService = "calendly" | "acuity" | "setmore";

interface BookingWidgetProps {
  service: BookingService;
  link: string;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ service, link }) => {
  if (!link) return null;

  const iframeProps = {
    className: "w-full min-h-[700px] border-none",
    src: link,
    allowFullScreen: true,
  } as const;

  switch (service) {
    case "calendly":
      return (
        <iframe
          {...iframeProps}
          src={`${link}${link.includes("?" ) ? "&" : "?"}embed_domain=${typeof window !== "undefined" ? window.location.hostname : ""}&embed_type=Inline`}
        />
      );
    case "acuity":
    case "setmore":
      return <iframe {...iframeProps} />;
    default:
      return null;
  }
};

export default BookingWidget;
