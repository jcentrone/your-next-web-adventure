import React from "react";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Navigation } from 'lucide-react';

interface RouteChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalDistanceMiles?: number;
  totalDurationMinutes?: number;
  estimatedFuelCost?: number;
  routeId?: string;
}

export function RouteChoiceDialog({
  open,
  onOpenChange,
  totalDistanceMiles,
  totalDurationMinutes,
  estimatedFuelCost,
  routeId
}: RouteChoiceDialogProps) {
  const navigate = useNavigate();

  const viewInApp = () => {
    if (routeId) {
      navigate(`/route/${routeId}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Route Ready</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {(totalDistanceMiles !== undefined ||
            totalDurationMinutes !== undefined ||
            estimatedFuelCost !== undefined) && (
            <div className="text-sm space-y-1 p-3 bg-muted rounded-lg">
              {totalDistanceMiles !== undefined && (
                <p><strong>Distance:</strong> {totalDistanceMiles.toFixed(1)} miles</p>
              )}
              {totalDurationMinutes !== undefined && (
                <p><strong>Duration:</strong> {Math.round(totalDurationMinutes)} minutes</p>
              )}
              {estimatedFuelCost !== undefined && (
                <p><strong>Est. Cost:</strong> ${estimatedFuelCost.toFixed(2)}</p>
              )}
            </div>
          )}
          
          <Button 
            onClick={viewInApp}
            disabled={!routeId}
            className="w-full flex items-center justify-center gap-2 h-12"
            size="lg"
          >
            <Navigation className="h-5 w-5" />
            <div>
              <div className="font-medium">View Route</div>
              <div className="text-xs opacity-80">Track progress & manage stops</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RouteChoiceDialog;