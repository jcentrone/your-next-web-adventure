import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RouteChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleMapsUrl: string;
  wazeUrl: string;
  totalDistanceMiles?: number;
  totalDurationMinutes?: number;
  estimatedFuelCost?: number;
}

export function RouteChoiceDialog({
  open,
  onOpenChange,
  googleMapsUrl,
  wazeUrl,
  totalDistanceMiles,
  totalDurationMinutes,
  estimatedFuelCost,
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
          {(totalDistanceMiles !== undefined ||
            totalDurationMinutes !== undefined ||
            estimatedFuelCost !== undefined) && (
            <div className="text-sm space-y-1">
              {totalDistanceMiles !== undefined && (
                <p>Total distance: {totalDistanceMiles.toFixed(1)} mi</p>
              )}
              {totalDurationMinutes !== undefined && (
                <p>Total duration: {Math.round(totalDurationMinutes)} mins</p>
              )}
              {estimatedFuelCost !== undefined && (
                <p>Est. fuel cost: ${estimatedFuelCost.toFixed(2)}</p>
              )}
            </div>
          )}
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
