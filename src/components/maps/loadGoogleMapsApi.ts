import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

export async function loadGoogleMapsApi(): Promise<typeof google> {
  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  loader = new Loader({ apiKey, libraries: [] });
  loadPromise = loader.load();
  return loadPromise;
}
