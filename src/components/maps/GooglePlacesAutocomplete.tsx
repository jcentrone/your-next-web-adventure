import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { reportIfMapsJsBlocked } from './loadGoogleMapsApi';

interface GooglePlacesAutocompleteProps {
  value?: string;
  onPlaceChange: (address: {
    formatted_address: string;
    place_id: string;
    latitude: number;
    longitude: number;
    address_components: any[];
  }) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const GooglePlacesAutocomplete = forwardRef<any, GooglePlacesAutocompleteProps>(
  (
    { value = '', onPlaceChange, onInputChange, placeholder = 'Enter address...', className },
    ref
  ) => {
    const internalRef = useRef<any>(null);
    const elementRef = (ref as React.MutableRefObject<any>) || internalRef;
    const onPlaceChangeRef = useRef(onPlaceChange);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      onPlaceChangeRef.current = onPlaceChange;
    }, [onPlaceChange]);

    useEffect(() => {
      if (elementRef.current && value !== undefined) {
        elementRef.current.value = value;
      }
    }, [value, elementRef]);

    useEffect(() => {
      let isMounted = true;
      const init = async () => {
        try {
          setIsLoading(true);
          const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('google-maps-proxy');
          if (apiKeyError || !apiKeyData?.apiKey) {
            throw new Error('Failed to get Google Maps API key');
          }

          if (!window.google?.maps?.importLibrary) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyData.apiKey}&v=weekly&libraries=places`;
              script.async = true;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load Google Maps script'));
              document.head.appendChild(script);
            });
          }

          if (!window.google?.maps?.importLibrary) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyData.apiKey}&v=weekly&libraries=places`;
              script.async = true;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load Google Maps script'));
              document.head.appendChild(script);
            });
          }

          if (window.google?.maps?.importLibrary) {
            await window.google.maps.importLibrary('places');
          }

          if (!isMounted || !elementRef.current) return;

          const el = elementRef.current;

          const handlePlaceChange = async (event: any) => {
            const place = event.detail?.place || event.place;
            if (!place) return;
            await place.fetchFields({
              fields: ['formatted_address', 'place_id', 'geometry', 'address_components'],
            });

            if (place.geometry?.location) {
              onPlaceChangeRef.current({
                formatted_address: place.formatted_address || '',
                place_id: place.place_id || '',
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address_components: place.address_components || [],
              });
            }
          };

          el.addEventListener('placechange', handlePlaceChange);
          el.addEventListener('gmp-placeselect', handlePlaceChange);

          if (onInputChange) {
            el.addEventListener('input', (e: any) => onInputChange(e.target.value));
          }

          return () => {
            el.removeEventListener('placechange', handlePlaceChange);
            el.removeEventListener('gmp-placeselect', handlePlaceChange);
          };
        } catch (error) {
          console.error('Error loading Google Maps:', error);
          toast({
            title: 'Google Maps blocked',
            description:
              'Disable blocking extensions or whitelist maps.googleapis.com to enable address autocomplete.',
            variant: 'destructive',
          });
          reportIfMapsJsBlocked();
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      init();

      return () => {
        isMounted = false;
      };
    }, [onInputChange, toast, elementRef]);

    return (
      <div className="relative bg-white">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <gmp-place-autocomplete
          ref={elementRef}
          placeholder={placeholder}
          class={`pl-10 bg-white text-black ${className || ''}`}
          style={{ '--gmpx-color-background': '#fff' } as React.CSSProperties}
        ></gmp-place-autocomplete>
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }
);

GooglePlacesAutocomplete.displayName = 'GooglePlacesAutocomplete';
