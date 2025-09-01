import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
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

          const loader = new Loader({
            apiKey: apiKeyData.apiKey,
            version: 'weekly',
            libraries: ['places'],
            url: 'https://maps.googleapis.com/maps/api/js?loading=async'
          });
          await loader.load();
          await window.google.maps.importLibrary('places');

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
          class={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground ${className || ''}`}
          style={{ 
            '--gmpx-color-background': 'hsl(var(--background))',
            '--gmpx-color-on-background': 'hsl(var(--foreground))',
            '--gmpx-color-primary': 'hsl(var(--primary))',
            '--gmpx-icon-search': 'none',
            '--gmpx-color-text': 'hsl(var(--foreground))',
            '--gmpx-color-placeholder': 'hsl(var(--muted-foreground))',
            '--gmpx-border-color': 'hsl(var(--border))',
            '--gmpx-focus-border-color': 'hsl(var(--ring))',
            '--gmpx-outline': 'none',
            '--gmpx-color-surface': 'hsl(var(--background))',
            '--gmpx-color-on-surface': 'hsl(var(--foreground))',
            '--gmpx-color-on-surface-variant': 'hsl(var(--foreground))',
            color: 'hsl(var(--foreground))',
            caretColor: 'hsl(var(--foreground))'
          } as React.CSSProperties}
        ></gmp-place-autocomplete>
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }
);

GooglePlacesAutocomplete.displayName = 'GooglePlacesAutocomplete';
