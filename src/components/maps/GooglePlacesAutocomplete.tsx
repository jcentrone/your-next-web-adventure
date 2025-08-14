import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GooglePlacesAutocompleteProps {
  value?: string;
  onChange: (address: {
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

export function GooglePlacesAutocomplete({
  value = '',
  onChange,
  onInputChange,
  placeholder = 'Enter address...',
  className,
}: GooglePlacesAutocompleteProps) {
  const elementRef = useRef<PlaceAutocompleteElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const { toast } = useToast();

  // Sync external value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Initialize Google Maps and PlaceAutocompleteElement
  useEffect(() => {
    let isMounted = true;

    const initializePlaceAutocomplete = async () => {
      try {
        setIsLoading(true);

        const { data: apiKeyData, error: apiKeyError } =
          await supabase.functions.invoke('google-maps-proxy');

        if (apiKeyError || !apiKeyData?.apiKey) {
          throw new Error('Failed to get Google Maps API key');
        }

        const loader = new Loader({
          apiKey: apiKeyData.apiKey,
          version: 'weekly',
          libraries: ['places', 'marker'],
        });

        await loader.load();

        if (!isMounted) return;

        // Configure the PlaceAutocompleteElement
        if (elementRef.current) {
          elementRef.current.types = ['address'];
          elementRef.current.fields = [
            'place_id',
            'formatted_address', 
            'geometry',
            'address_components',
          ];

          // Add event listener for place selection
          const handlePlaceSelect = (event: PlaceSelectEvent) => {
            const place = event.detail.place;
            
            if (place?.geometry?.location) {
              const addressData = {
                formatted_address: place.formatted_address || '',
                place_id: place.place_id || '',
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address_components: place.address_components || [],
              };

              setDisplayValue(addressData.formatted_address);
              onChange(addressData);
            }
          };

          elementRef.current.addEventListener('gmp-placeselect', handlePlaceSelect);

          // Return cleanup function
          return () => {
            elementRef.current?.removeEventListener('gmp-placeselect', handlePlaceSelect);
          };
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Google Maps. Please enter address manually.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializePlaceAutocomplete();

    return () => {
      isMounted = false;
    };
  }, [onChange, toast]);

  const handleInput = (e: React.FormEvent<PlaceAutocompleteElement>) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    setDisplayValue(newValue);
    onInputChange?.(newValue);
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      
      <gmp-place-autocomplete
        ref={elementRef}
        style={{
          width: '100%',
          height: '40px',
          paddingLeft: '2.5rem',
          paddingRight: isLoading ? '2.5rem' : '0.75rem',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'calc(var(--radius) - 2px)',
          backgroundColor: 'hsl(var(--background))',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          outline: 'none',
        }}
        placeholder={placeholder}
        value={displayValue}
        onInput={handleInput}
        className={className}
      />
      
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
      )}
    </div>
  );
}
