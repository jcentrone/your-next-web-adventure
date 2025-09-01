import React, { useState, forwardRef, useCallback, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  value?: string;
  onAddressChange?: (address: {
    formatted_address: string;
    place_id?: string;
    latitude?: number;
    longitude?: number;
    address_components?: any[];
  }) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  (
    { value = '', onAddressChange, onInputChange, placeholder = 'Enter address...', className },
    ref
  ) => {
    const [isGeocoding, setIsGeocoding] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    const handleGeocode = useCallback(async (address: string) => {
      if (!address.trim()) return;

      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        const data = await response.json();
        
        if (data.length > 0) {
          const result = data[0];
          if (onAddressChange) {
            onAddressChange({
              formatted_address: result.display_name,
              place_id: result.place_id?.toString(),
              latitude: parseFloat(result.lat),
              longitude: parseFloat(result.lon),
            });
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsGeocoding(false);
      }
    }, [onAddressChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onInputChange) {
        onInputChange(newValue);
      }
      
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // If onAddressChange is provided, call it with just the formatted address
      if (onAddressChange) {
        onAddressChange({
          formatted_address: newValue,
        });
      }

      // Debounce geocoding for auto-completion
      if (newValue.trim().length > 3) {
        debounceTimeoutRef.current = setTimeout(() => {
          handleGeocode(newValue);
        }, 1000); // Wait 1 second after user stops typing
      }
    };


    return (
      <div className={cn("relative w-full", className)}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
        />
        {isGeocoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>
    );
  }
);

AddressAutocomplete.displayName = 'AddressAutocomplete';