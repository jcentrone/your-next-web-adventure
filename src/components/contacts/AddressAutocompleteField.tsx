import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GooglePlacesAutocomplete } from "@/components/maps/GooglePlacesAutocomplete";
import { extractAddressComponents } from "@/lib/addressUtils";
import type { UseFormReturn } from "react-hook-form";

interface AddressAutocompleteFieldProps {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
  placeholder?: string;
  onPlaceSelect?: (addressData: any) => void;
}

export const AddressAutocompleteField: React.FC<AddressAutocompleteFieldProps> = ({
  form,
  name = "formatted_address",
  label = "Address",
  placeholder = "Start typing an address...",
  onPlaceSelect,
}) => {
  const handlePlaceChange = (place: any) => {
    if (place) {
      const addressData = extractAddressComponents(place);
      
      // Set all address-related fields
      form.setValue("formatted_address", addressData.formatted_address || "");
      form.setValue("place_id", addressData.place_id || "");
      form.setValue("latitude", addressData.latitude || null);
      form.setValue("longitude", addressData.longitude || null);
      form.setValue("address_components", addressData.address_components || null);
      form.setValue("address", addressData.address || "");
      form.setValue("city", addressData.city || "");
      form.setValue("state", addressData.state || "");
      form.setValue("zip_code", addressData.zip_code || "");

      // Call custom handler if provided
      onPlaceSelect?.(addressData);
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <GooglePlacesAutocomplete
              value={field.value || ""}
              onPlaceChange={handlePlaceChange}
              onInputChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AddressAutocompleteField;