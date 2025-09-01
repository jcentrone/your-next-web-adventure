import React, { useState, forwardRef, useCallback, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader } from '@googlemaps/js-api-loader';

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
    const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();
    const autocompleteServiceRef = useRef<any>();
    const placesServiceRef = useRef<any>();

    // Initialize Google Maps API
    useEffect(() => {
      const initGoogleMaps = async () => {
        try {
          // Get Google Maps API key from edge function
          const response = await fetch('/functions/v1/google-maps-proxy', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error('Failed to get API key');
          }

          const { apiKey } = await response.json();

          const loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places']
          });

          await loader.load();
          
          autocompleteServiceRef.current = new (window as any).google.maps.places.AutocompleteService();
          
          // Create a dummy div for PlacesService
          const dummyDiv = document.createElement('div');
          placesServiceRef.current = new (window as any).google.maps.places.PlacesService(dummyDiv);
          
          setGoogleMapsLoaded(true);
        } catch (error) {
          console.error('Failed to load Google Maps:', error);
        }
      };

      initGoogleMaps();
    }, []);

    const handleGeocode = useCallback(async (address: string) => {
      if (!address.trim() || !googleMapsLoaded || !autocompleteServiceRef.current) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsGeocoding(true);
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: address,
            componentRestrictions: { country: 'us' },
            types: ['address']
          },
          (predictions: any[], status: any) => {
            setIsGeocoding(false);
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowDropdown(predictions.length > 0);
            } else {
              setSuggestions([]);
              setShowDropdown(false);
            }
          }
        );
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
        setShowDropdown(false);
        setIsGeocoding(false);
      }
    }, [googleMapsLoaded]);

    const handleSuggestionSelect = (suggestion: any) => {
      if (!placesServiceRef.current) return;

      const formattedAddress = suggestion.description;
      
      if (onInputChange) {
        onInputChange(formattedAddress);
      }

      // Get detailed place information
      placesServiceRef.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
        },
        (place: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place && onAddressChange) {
            onAddressChange({
              formatted_address: place.formatted_address || formattedAddress,
              place_id: place.place_id,
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng(),
              address_components: place.address_components
            });
          }
        }
      );
      
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
                  {suggestion.description}
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