import { loadGoogleMapsApi, reportIfMapsJsBlocked } from "./loadGoogleMapsApi";
import { toast } from "@/hooks/use-toast";

export interface OptimizedRoute {
  googleMapsUrl: string;
  wazeUrl: string;
  totalDistanceMiles: number;
  totalDurationMinutes: number;
  waypointOrder: number[];
}

/**
 * Computes an optimized driving route using Google Maps JS API.
 * Returns deep links for Google Maps and Waze with all stops preloaded.
 */
export async function getOptimizedRoute(addresses: string[]): Promise<OptimizedRoute> {
  if (addresses.length < 2) {
    throw new Error("At least two addresses are required");
  }

  try {
    const google = await loadGoogleMapsApi();

    const origin = addresses[0];
    const destination = addresses[addresses.length - 1];
    const waypoints = addresses.slice(1, -1);

    const service = new google.maps.DirectionsService();
    const result = await service.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
      waypoints: waypoints.map((w) => ({ location: w })),
    });

    const order: number[] = result.routes[0].waypoint_order || [];
    const orderedWaypoints = order.map((i) => waypoints[i]);

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}${
      orderedWaypoints.length
        ? `&waypoints=${orderedWaypoints
            .map((w) => encodeURIComponent(w))
            .join("|")}`
        : ""
    }`;

    const coords: string[] = [];
    result.routes[0].legs.forEach((leg) => {
      coords.push(`${leg.start_location.lat()},${leg.start_location.lng()}`);
    });
    const lastLeg = result.routes[0].legs[result.routes[0].legs.length - 1];
    coords.push(`${lastLeg.end_location.lat()},${lastLeg.end_location.lng()}`);
    const wazeUrl = `https://waze.com/ul?from=${coords[0]}${coords
      .slice(1)
      .map((c) => `&to=${c}`)
      .join("")}&navigate=yes`;

    const legs = result.routes[0].legs;
    const totalDistanceMeters = legs.reduce(
      (sum, leg) => sum + (leg.distance?.value || 0),
      0
    );
    const totalDurationSeconds = legs.reduce(
      (sum, leg) => sum + (leg.duration?.value || 0),
      0
    );
    const totalDistanceMiles = totalDistanceMeters / 1609.344;
    const totalDurationMinutes = totalDurationSeconds / 60;

    return {
      googleMapsUrl,
      wazeUrl,
      totalDistanceMiles,
      totalDurationMinutes,
      waypointOrder: order,
    };
  } catch (error) {
    console.error("Error optimizing route:", error);
    
    // Let the loadGoogleMapsApi function handle the specific error messaging
    // Don't show a generic message here since it masks the real issue
    throw error;
  }
}
