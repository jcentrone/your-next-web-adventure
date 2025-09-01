import React, { useState, forwardRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onInputChange) {
        onInputChange(newValue);
      }
      
      // If onAddressChange is provided, call it with just the formatted address
      if (onAddressChange) {
        onAddressChange({
          formatted_address: newValue,
        });
      }
    };

    const handleGeocode = async () => {
      if (!value.trim()) {
        toast({
          title: 'No address entered',
          description: 'Please enter an address to geocode',
          variant: 'destructive',
        });
        return;
      }

      setIsGeocoding(true);
      try {
        // Use a simple geocoding service (you can replace this with your preferred service)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=1`
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
          
          toast({
            title: 'Address found',
            description: 'Location coordinates have been updated',
          });
        } else {
          toast({
            title: 'Address not found',
            description: 'Could not find coordinates for this address',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast({
          title: 'Geocoding failed',
          description: 'Unable to find location coordinates. The address will still be saved.',
          variant: 'destructive',
        });
      } finally {
        setIsGeocoding(false);
      }
    };

    return (
      <div className={cn("relative flex w-full", className)}>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={ref}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10 pr-12"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGeocode}
          disabled={isGeocoding || !value.trim()}
          className="ml-2 px-3"
          title="Find coordinates for this address"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

AddressAutocomplete.displayName = 'AddressAutocomplete';