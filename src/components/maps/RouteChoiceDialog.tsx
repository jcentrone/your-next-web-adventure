import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RouteChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleMapsUrl: string;
  wazeUrl: string;
}

export function RouteChoiceDialog({
  open,
  onOpenChange,
  googleMapsUrl,
  wazeUrl,
}: RouteChoiceDialogProps) {
  const handleSelect = (url: string) => {
    onOpenChange(false);
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Choose Navigation App</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={() => handleSelect(googleMapsUrl)}
            className="flex items-center gap-2"
          >
            <img src="/google-maps.svg" alt="Google Maps" className="h-5 w-5" />
            Google Maps
          </Button>
          <Button onClick={() => handleSelect(wazeUrl)} className="flex items-center gap-2">
            <img src="/waze.svg" alt="Waze" className="h-5 w-5" />
            Waze
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RouteChoiceDialog;
