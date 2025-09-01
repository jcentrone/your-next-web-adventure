export interface OptimizedRoute {
  googleMapsUrl: string;
  wazeUrl: string;
}

/**
 * Computes an optimized driving route using Google Maps Directions API.
 * Returns deep links for Google Maps and Waze with all stops preloaded.
 */
export async function getOptimizedRoute(addresses: string[]): Promise<OptimizedRoute> {
  if (addresses.length < 2) {
    throw new Error("At least two addresses are required");
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Google Maps API key not configured");
  }

  const origin = addresses[0];
  const destination = addresses[addresses.length - 1];
  const waypoints = addresses.slice(1, -1);

  const params = new URLSearchParams({
    origin,
    destination,
    key: apiKey,
    mode: "driving",
  });

  if (waypoints.length) {
    params.set(
      "waypoints",
      `optimize:true|${waypoints.map((w) => encodeURIComponent(w)).join("|")}`
    );
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(data.error_message || "Directions request failed");
  }

  const order: number[] = data.routes[0].waypoint_order || [];
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
  data.routes[0].legs.forEach(
    (leg: { start_location: { lat: number; lng: number }; end_location: { lat: number; lng: number } }) => {
      coords.push(`${leg.start_location.lat},${leg.start_location.lng}`);
    }
  );
  const lastLeg = data.routes[0].legs[data.routes[0].legs.length - 1] as {
    end_location: { lat: number; lng: number };
  };
  coords.push(`${lastLeg.end_location.lat},${lastLeg.end_location.lng}`);
  const wazeUrl = `https://waze.com/ul?from=${coords[0]}${coords
    .slice(1)
    .map((c) => `&to=${c}`)
    .join("")}&navigate=yes`;

  return { googleMapsUrl, wazeUrl };
}
