import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Navigation } from 'lucide-react';

interface RouteChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleMapsUrl?: string;
  wazeUrl?: string;
  totalDistanceMiles?: number;
  totalDurationMinutes?: number;
  estimatedFuelCost?: number;
  preferredNavApp?: "google_maps" | "waze";
  routeId?: string;
}

export function RouteChoiceDialog({
  open,
  onOpenChange,
  googleMapsUrl,
  wazeUrl,
  totalDistanceMiles,
  totalDurationMinutes,
  estimatedFuelCost,
  preferredNavApp,
  routeId
}: RouteChoiceDialogProps) {
  const navigate = useNavigate();

  const openGoogleMaps = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank');
    }
  };

  const openWaze = () => {
    if (wazeUrl) {
      window.open(wazeUrl, '_blank');
    }
  };

  const viewInApp = () => {
    if (routeId) {
      navigate(`/route/${routeId}`);
      onOpenChange(false);
    }
  };

  // Always show the dialog first to give user choice between in-app and external navigation
  // The preferred app will be highlighted but not auto-opened

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>View Your Route</DialogTitle>
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
          
          <div className="space-y-3">
            <Button 
              onClick={viewInApp}
              disabled={!routeId}
              className="w-full flex items-center justify-center gap-2 h-12"
              size="lg"
            >
              <Navigation className="h-5 w-5" />
              <div>
                <div className="font-medium">View Route in App</div>
                <div className="text-xs opacity-80">Track progress & manage stops</div>
              </div>
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={openGoogleMaps}
                disabled={!googleMapsUrl}
                variant={preferredNavApp === 'google_maps' ? 'default' : 'outline'}
                className="flex items-center justify-center gap-2 h-12"
              >
                <img src="/google-maps.svg" alt="Google Maps" className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Google Maps</div>
                  <div className="text-xs text-muted-foreground">
                    {preferredNavApp === 'google_maps' ? 'Preferred' : 'External'}
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={openWaze}
                disabled={!wazeUrl}
                variant={preferredNavApp === 'waze' ? 'default' : 'outline'}
                className="flex items-center justify-center gap-2 h-12"
              >
                <img src="/waze.svg" alt="Waze" className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Waze</div>
                  <div className="text-xs text-muted-foreground">
                    {preferredNavApp === 'waze' ? 'Preferred' : 'External'}
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RouteChoiceDialog;
