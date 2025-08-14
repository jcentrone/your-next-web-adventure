import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  placeholder = "Enter address...",
  className
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSelectingFromGoogle = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        setIsLoading(true);
        
        // Get API key from edge function
        const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('google-maps-proxy');
        
        if (apiKeyError || !apiKeyData?.apiKey) {
          throw new Error('Failed to get Google Maps API key');
        }
        
        const loader = new Loader({
          apiKey: apiKeyData.apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        if (inputRef.current && window.google) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['address'],
              fields: ['place_id', 'formatted_address', 'geometry', 'address_components']
            }
          );

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            
            if (place && place.geometry && place.geometry.location) {
              isSelectingFromGoogle.current = true;
              
              const addressData = {
                formatted_address: place.formatted_address || '',
                place_id: place.place_id || '',
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                address_components: place.address_components || []
              };
              
              // Call onChange which will update the form value
              onChange(addressData);
              
              // Reset the flag after a brief delay
              setTimeout(() => {
                isSelectingFromGoogle.current = false;
              }, 100);
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please enter address manually.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only call onInputChange when user is actually typing, not when Google Places updates
    if (!isSelectingFromGoogle.current) {
      const newValue = e.target.value;
      onInputChange?.(newValue);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          disabled={isLoading}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}