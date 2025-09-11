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

function getSpecificErrorMessage(error: any): { title: string; description: string } {
  const errorMessage = error?.message || error?.toString() || '';
  const errorCode = error?.code || error?.status;
  
  console.error('Google Maps API Error Details:', {
    message: errorMessage,
    code: errorCode,
    stack: error?.stack,
    fullError: error
  });

  // API key issues
  if (errorMessage.includes('API key') || errorMessage.includes('InvalidKeyMapError')) {
    return {
      title: 'Invalid Google Maps API Key',
      description: 'The Google Maps API key is invalid or not configured properly.'
    };
  }

  // Quota/billing issues
  if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorCode === 429) {
    return {
      title: 'Google Maps API Quota Exceeded',
      description: 'The API quota has been exceeded or billing is not set up.'
    };
  }

  // Service not enabled
  if (errorMessage.includes('not enabled') || errorMessage.includes('SERVICE_NOT_FOUND')) {
    return {
      title: 'Google Maps Service Not Enabled',
      description: 'The required Google Maps services (Directions API, Places API) are not enabled for this API key.'
    };
  }

  // Network/connectivity issues
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorCode >= 500) {
    return {
      title: 'Network Connection Error',
      description: 'Unable to connect to Google Maps services. Check your internet connection.'
    };
  }

  // CORS or blocking issues
  if (errorMessage.includes('CORS') || errorMessage.includes('blocked') || errorMessage.includes('refused')) {
    return {
      title: 'Google Maps Blocked',
      description: 'Google Maps is being blocked. Try disabling ad blockers or browser extensions.'
    };
  }

  // Default fallback
  return {
    title: 'Google Maps Error',
    description: `Error loading Google Maps: ${errorMessage.substring(0, 100)}`
  };
}

export async function loadGoogleMapsApi(): Promise<any> {
  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    const errorMsg = { title: 'Google Maps unavailable', description: 'Google Maps API key not configured in environment variables.' };
    toast(errorMsg);
    throw new Error('Google Maps API key not configured');
  }

  console.log('Loading Google Maps API with key:', apiKey.substring(0, 10) + '...');

  loader = new Loader({ 
    apiKey, 
    libraries: ['places'] // Add libraries that might be needed
  });
  
  loadPromise = (async () => {
    try {
      const google = await loader.load();
      console.log('Google Maps API loaded successfully');
      return google;
    } catch (error) {
      console.error('Failed to load Google Maps API:', error);
      const errorMsg = getSpecificErrorMessage(error);
      toast({
        title: errorMsg.title,
        description: errorMsg.description,
        variant: 'destructive',
      });
      
      // Only report blocking if it's actually a blocking issue
      if (errorMsg.title.includes('Blocked')) {
        reportIfMapsJsBlocked();
      }
      
      loader = null;
      loadPromise = null;
      throw error;
    }
  })();
  return loadPromise;
}
