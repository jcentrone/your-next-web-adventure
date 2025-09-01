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
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    const handleGeocode = useCallback(async (address: string) => {
      if (!address.trim()) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=us&addressdetails=1&extratags=1`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        const data = await response.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsGeocoding(false);
      }
    }, []);

    const handleSuggestionSelect = (suggestion: any) => {
      const formattedAddress = suggestion.display_name;
      
      if (onInputChange) {
        onInputChange(formattedAddress);
      }
      
      if (onAddressChange) {
        onAddressChange({
          formatted_address: formattedAddress,
          place_id: suggestion.place_id?.toString(),
          latitude: parseFloat(suggestion.lat),
          longitude: parseFloat(suggestion.lon),
        });
      }
      
      setShowDropdown(false);
      setSuggestions([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onInputChange) {
        onInputChange(newValue);
      }
      
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce geocoding for auto-completion
      if (newValue.trim().length > 3) {
        debounceTimeoutRef.current = setTimeout(() => {
          handleGeocode(newValue);
        }, 1000); // Wait 1 second after user stops typing
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    };

    return (
      <div className={cn("relative w-full", className)}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow clicking suggestions
        />
        {isGeocoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
        
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id || index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors border-b border-border last:border-b-0"
              >
                <div className="font-medium text-sm">
                  {suggestion.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

AddressAutocomplete.displayName = 'AddressAutocomplete';