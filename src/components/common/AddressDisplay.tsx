import React from "react";
import { getDisplayAddress, type AddressData } from "@/lib/addressUtils";
import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  contact: AddressData;
  className?: string;
  maxLength?: number;
  showIcon?: boolean;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  contact,
  className,
  maxLength,
  showIcon = false,
}) => {
  const address = getDisplayAddress(contact, { maxLength });

  if (!address) {
    return null;
  }

  return (
    <div className={cn("flex items-start gap-1", className)}>
      {showIcon && (
        <svg
          className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
      <span className="text-sm text-muted-foreground">{address}</span>
    </div>
  );
};

export default AddressDisplay;