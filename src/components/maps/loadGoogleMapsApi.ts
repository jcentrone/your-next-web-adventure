import { Loader } from '@googlemaps/js-api-loader';
import { toast } from '@/hooks/use-toast';

let loader: Loader | null = null;
let loadPromise: Promise<any> | null = null;

export function reportMapsJsBlocked() {
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/monitoring/mapsjs-gen204-blocked', '');
    } else if (typeof fetch !== 'undefined') {
      fetch('/api/monitoring/mapsjs-gen204-blocked', {
        method: 'POST',
        keepalive: true,
      }).catch(() => {
        /* ignore errors */
      });
    }
  } catch (err) {
    console.warn('Failed to report mapsjs/gen_204 block', err);
  }
}

export async function reportIfMapsJsBlocked() {
  try {
    await fetch('https://maps.googleapis.com/mapsjs/gen_204', { mode: 'no-cors' });
  } catch {
    reportMapsJsBlocked();
  }
}

export async function loadGoogleMapsApi(): Promise<any> {
  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    toast({
      title: 'Google Maps unavailable',
      description:
        'Disable blocking extensions or whitelist maps.googleapis.com and try again.',
      variant: 'destructive',
    });
    throw new Error('Google Maps API key not configured');
  }

  loader = new Loader({ apiKey, libraries: [] });
  loadPromise = (async () => {
    try {
      return await loader.load();
    } catch (error) {
      toast({
        title: 'Google Maps blocked',
        description:
          'Disable blocking extensions or whitelist maps.googleapis.com.',
        variant: 'destructive',
      });
      reportIfMapsJsBlocked();
      loader = null;
      loadPromise = null;
      throw error;
    }
  })();
  return loadPromise;
}
