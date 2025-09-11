import type { Contact } from "@/lib/crmSchemas";

export interface AddressData {
  formatted_address?: string | null;
  place_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address_components?: any;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

/**
 * Gets the most complete address available from contact data
 * Prioritizes formatted_address, then constructs from components
 */
export function getCompleteAddress(contact: AddressData): string {
  // First try formatted_address if it's complete (contains city/state info)
  if (contact.formatted_address) {
    // Check if formatted_address seems complete (has comma separators indicating city/state)
    const commaCount = (contact.formatted_address.match(/,/g) || []).length;
    if (commaCount >= 2) {
      return contact.formatted_address;
    }
  }

  // Fall back to constructing from individual components
  const addressParts = [
    contact.address,
    contact.city,
    contact.state,
    contact.zip_code
  ].filter(Boolean);

  if (addressParts.length > 0) {
    return addressParts.join(", ");
  }

  // Last resort: return formatted_address even if incomplete, or empty string
  return contact.formatted_address || "";
}

/**
 * Validates if an address appears to be complete
 * Returns true if address has street, city, and state information
 */
export function isAddressComplete(address: AddressData): boolean {
  // Check if formatted_address seems complete
  if (address.formatted_address) {
    const commaCount = (address.formatted_address.match(/,/g) || []).length;
    if (commaCount >= 2) return true;
  }

  // Check if individual components are complete
  return !!(address.address && address.city && address.state);
}

/**
 * Extracts address components from Google Places data
 */
export function extractAddressComponents(place: any): Partial<AddressData> {
  const components = place.address_components || [];
  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let zipCode = "";

  components.forEach((component: any) => {
    const types = component.types;
    
    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    } else if (types.includes("route")) {
      route = component.long_name;
    } else if (types.includes("locality")) {
      city = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      state = component.short_name;
    } else if (types.includes("postal_code")) {
      zipCode = component.long_name;
    }
  });

  const address = [streetNumber, route].filter(Boolean).join(" ");

  return {
    formatted_address: place.formatted_address,
    place_id: place.place_id,
    latitude: place.geometry?.location?.lat?.() || place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng?.() || place.geometry?.location?.lng,
    address_components: components,
    address,
    city,
    state,
    zip_code: zipCode,
  };
}

/**
 * Gets display address with optional formatting
 */
export function getDisplayAddress(contact: AddressData, options?: {
  maxLength?: number;
  includeFullAddress?: boolean;
}): string {
  const fullAddress = getCompleteAddress(contact);
  
  if (!fullAddress) return "";
  
  if (options?.maxLength && fullAddress.length > options.maxLength) {
    return fullAddress.substring(0, options.maxLength) + "...";
  }
  
  return fullAddress;
}