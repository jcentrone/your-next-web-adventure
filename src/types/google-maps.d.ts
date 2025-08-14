declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              fields?: string[];
            }
          ) => {
            addListener: (event: string, handler: () => void) => void;
            getPlace: () => {
              place_id?: string;
              formatted_address?: string;
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              address_components?: any[];
            };
          };
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
  }
}

export {};