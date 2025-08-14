import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const { toast } = useToast();

  // Sync external value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Initialize Google Autocomplete
  useEffect(() => {
    let isMounted = true;

    const initializeAutocomplete = async () => {
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
          libraries: ['places'],
        });

        await loader.load();

        if (!isMounted || !inputRef.current) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            fields: [
              'place_id',
              'formatted_address',
              'geometry',
              'address_components',
            ],
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place?.geometry?.location && place.formatted_address) {
            const addressData = {
              formatted_address: place.formatted_address,
              place_id: place.place_id || '',
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              address_components: place.address_components || [],
            };

            setDisplayValue(addressData.formatted_address);
            onChange(addressData);
          }
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load Google Maps. Please enter address manually.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAutocomplete();

    return () => {
      isMounted = false;
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [onChange, toast]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    onInputChange?.(newValue);
  }, [onInputChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission when Google Places dropdown is visible
    if (e.key === 'Enter') {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && (pacContainer as HTMLElement).style.display !== 'none') {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, []);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`pl-10 ${className || ''}`}
        disabled={isLoading}
        autoComplete="off"
      />
      
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
      )}
    </div>
  );
}

