/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
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
    address_components: google.maps.GeocoderAddressComponent[];
  }) => void;
  onInputChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export function GooglePlacesAutocomplete({
  value = '',
  onChange,
  onInputChange,
  onFocus,
  onBlur,
  placeholder = 'Enter address...',
  className,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);

  const [isLoading, setIsLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const { toast } = useToast();

  // keep latest onChange without rerunning init
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // reflect external value
  useEffect(() => {
    setDisplayValue(value ?? '');
  }, [value]);

  // init once
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);

        const { data: apiKeyData, error: apiKeyError } =
          await supabase.functions.invoke('google-maps-proxy');

        if (apiKeyError || !apiKeyData?.apiKey) throw new Error('No Maps API key');

        const loader = new Loader({
          apiKey: apiKeyData.apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        if (!mounted || !inputRef.current) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' }, // match working impl
            fields: ['formatted_address', 'address_components', 'geometry', 'place_id'],
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place?.geometry?.location || !place.formatted_address) return;

          // Add small delay to ensure all Google events complete before dialog interaction
          setTimeout(() => {
            const addressData = {
              formatted_address: place.formatted_address,
              place_id: place.place_id ?? '',
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              address_components: place.address_components ?? [],
            };

            setDisplayValue(addressData.formatted_address);
            onChangeRef.current(addressData);
          }, 50);
        });
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        if (mounted) {
          toast({
            title: 'Error',
            description: 'Failed to load Google Maps. Please enter address manually.',
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
    // DO NOT add onChange/toast as deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDisplayValue(v);
    onInputChange?.(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // block parent form submit when selecting from PAC
    if (e.key === 'Enter' && autocompleteRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); }
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          onFocus?.();
        }}
        onBlur={() => {
          // Delay blur to allow place selection
          setTimeout(() => onBlur?.(), 150);
        }}
        placeholder={placeholder}
        className={`pl-10 ${className || ''}`}
        disabled={isLoading}
        autoComplete="new-password"
        name="address_autocomplete_field"
        data-lpignore="true"
        data-form-type="other"
        data-1p-ignore="true"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
      )}
    </div>
  );
}
