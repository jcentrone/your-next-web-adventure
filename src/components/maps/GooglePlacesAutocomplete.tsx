import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { reportIfMapsJsBlocked } from './loadGoogleMapsApi';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useThemeContext } from '@/components/ThemeProvider';

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

export const GooglePlacesAutocomplete = forwardRef<HTMLInputElement, GooglePlacesAutocompleteProps>(
  (
    { value = '', onPlaceChange, onInputChange, placeholder = 'Enter address...', className },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const elementRef = (ref as React.MutableRefObject<HTMLInputElement>) || internalRef;
    const autocompleteRef = useRef<any | null>(null);
    const onPlaceChangeRef = useRef(onPlaceChange);
    const { toast } = useToast();
    const { effectiveTheme } = useThemeContext();
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

      const init = async () => {
        try {
          setIsLoading(true);
          console.log('🗺️ Initializing Google Maps API...');
          
          const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('google-maps-proxy');
          if (apiKeyError || !apiKeyData?.apiKey) {
            console.error('API Key error:', apiKeyError);
            throw new Error('Failed to get Google Maps API key');
          }

          console.log('🗺️ API key obtained successfully');

          const loader = new Loader({
            apiKey: apiKeyData.apiKey,
            version: 'weekly',
            libraries: ['places'],
          });
          
          await loader.load();
          console.log('🗺️ Google Maps API loaded');

          if (!isMounted || !elementRef.current) {
            console.log('Component unmounted or element not available');
            return;
          }

          const input = elementRef.current;
          setApiLoaded(true);

          // Set initial value after API loads
          if (value) {
            input.value = value;
          }

          // Create autocomplete instance
          const googleMaps = (window as any).google;
          autocompleteRef.current = new googleMaps.maps.places.Autocomplete(input, {
            fields: ['formatted_address', 'place_id', 'geometry', 'address_components'],
          });

          // Apply dark mode styling to the dropdown
          if (effectiveTheme === 'dark') {
            const pacContainer = document.querySelector('.pac-container') as HTMLElement;
            if (pacContainer) {
              pacContainer.style.backgroundColor = 'hsl(var(--background))';
              pacContainer.style.border = '1px solid hsl(var(--border))';
              pacContainer.style.borderRadius = '8px';
            }
            
            // Style individual items
            const observer = new MutationObserver(() => {
              const pacItems = document.querySelectorAll('.pac-item');
              pacItems.forEach((item) => {
                const htmlItem = item as HTMLElement;
                htmlItem.style.backgroundColor = 'hsl(var(--background))';
                htmlItem.style.color = 'hsl(var(--foreground))';
                htmlItem.style.borderBottom = '1px solid hsl(var(--border))';
                
                htmlItem.addEventListener('mouseenter', () => {
                  htmlItem.style.backgroundColor = 'hsl(var(--accent))';
                });
                
                htmlItem.addEventListener('mouseleave', () => {
                  htmlItem.style.backgroundColor = 'hsl(var(--background))';
                });
              });
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            // Cleanup observer
            setTimeout(() => observer.disconnect(), 10000);
          }

          console.log('🗺️ Autocomplete instance created');

          // Add place change listener
          const placeChangedListener = () => {
            console.log('🎯 Place changed event fired');
            const place = autocompleteRef.current?.getPlace();
            
            if (!place) {
              console.log('🎯 No place data available');
              return;
            }

            console.log('🎯 Place data received:', place);

            if (place.geometry?.location) {
              const placeData = {
                formatted_address: place.formatted_address || '',
                place_id: place.place_id || '',
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address_components: place.address_components || [],
              };

              console.log('🎯 Calling onPlaceChange with:', placeData);
              onPlaceChangeRef.current(placeData);
            } else {
              console.log('🎯 No geometry data in place');
            }
          };

          autocompleteRef.current.addListener('place_changed', placeChangedListener);

          console.log('🗺️ Place change listener attached');

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
        if (autocompleteRef.current) {
          (window as any).google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        }
      };
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('🎯 Input change:', e.target.value);
      if (onInputChange) {
        onInputChange(e.target.value);
      }
    };

    return (
      <div className={cn("relative w-full", className)}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none" />
        <Input
          ref={elementRef}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onChange={handleInputChange}
          defaultValue={value}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
        )}
      </div>
    );
  }
);

GooglePlacesAutocomplete.displayName = 'GooglePlacesAutocomplete';
