import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { reportIfMapsJsBlocked } from './loadGoogleMapsApi';
import { cn } from '@/lib/utils';

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
    const [apiLoaded, setApiLoaded] = useState(false);

    useEffect(() => {
      onPlaceChangeRef.current = onPlaceChange;
    }, [onPlaceChange]);

    useEffect(() => {
      if (elementRef.current && value !== undefined && apiLoaded) {
        elementRef.current.value = value;
      }
    }, [value, elementRef, apiLoaded]);

    useEffect(() => {
      let isMounted = true;
      let cleanupFn: (() => void) | null = null;

      const init = async () => {
        try {
          setIsLoading(true);
          console.log('Initializing Google Maps API...');
          
          const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('google-maps-proxy');
          if (apiKeyError || !apiKeyData?.apiKey) {
            console.error('API Key error:', apiKeyError);
            throw new Error('Failed to get Google Maps API key');
          }

          console.log('API key obtained successfully');

          const loader = new Loader({
            apiKey: apiKeyData.apiKey,
            version: 'weekly',
            libraries: ['places'],
          });
          
          await loader.load();
          console.log('Google Maps API loaded');
          
          await window.google.maps.importLibrary('places');
          console.log('Places library imported');

          if (!isMounted || !elementRef.current) {
            console.log('Component unmounted or element not available');
            return;
          }

          const el = elementRef.current;
          setApiLoaded(true);

          // Set initial value after API loads
          if (value) {
            el.value = value;
          }

          const handlePlaceChange = async (event: any) => {
            console.log('Place change event:', event.type, event);
            const place = event.detail?.place || event.place;
            if (!place) {
              console.log('No place data in event');
              return;
            }

            try {
              await place.fetchFields({
                fields: ['formatted_address', 'place_id', 'geometry', 'address_components'],
              });

              console.log('Place data fetched:', place);

              if (place.geometry?.location) {
                onPlaceChangeRef.current({
                  formatted_address: place.formatted_address || '',
                  place_id: place.place_id || '',
                  latitude: place.geometry.location.lat(),
                  longitude: place.geometry.location.lng(),
                  address_components: place.address_components || [],
                });
              }
            } catch (error) {
              console.error('Error fetching place details:', error);
            }
          };

          const handleInput = (e: any) => {
            console.log('Input event:', e.target.value);
            if (onInputChange) {
              onInputChange(e.target.value);
            }
          };

          // Add event listeners
          el.addEventListener('gmp-placeselect', handlePlaceChange);
          el.addEventListener('input', handleInput);

          console.log('Event listeners attached');

          cleanupFn = () => {
            console.log('Cleaning up event listeners');
            el.removeEventListener('gmp-placeselect', handlePlaceChange);
            el.removeEventListener('input', handleInput);
          };

        } catch (error) {
          console.error('Error loading Google Maps:', error);
          toast({
            title: 'Google Maps Error',
            description: 'Failed to load Google Maps. Please check your internet connection.',
            variant: 'destructive',
          });
          reportIfMapsJsBlocked();
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      init();

      return () => {
        isMounted = false;
        if (cleanupFn) {
          cleanupFn();
        }
      };
    }, [onInputChange, toast, elementRef]);

    return (
      <div className={cn(
        "relative w-full",
        "before:absolute before:inset-0 before:rounded-md before:border before:border-input before:pointer-events-none",
        "focus-within:before:ring-2 focus-within:before:ring-ring focus-within:before:ring-offset-2",
        "focus-within:before:border-ring",
        className
      )}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none" />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <gmp-place-autocomplete
          ref={elementRef}
          placeholder={placeholder}
          class="w-full h-10 pl-10 pr-3 py-2 text-sm bg-transparent border-0 outline-0 rounded-md"
          style={{
            color: 'inherit',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit'
          } as React.CSSProperties}
        ></gmp-place-autocomplete>
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
        )}
      </div>
    );
  }
);

GooglePlacesAutocomplete.displayName = 'GooglePlacesAutocomplete';
