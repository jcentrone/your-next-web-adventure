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
        importLibrary: (library: string) => Promise<any>;
      };
    };
  }
  
  var google: {
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
      importLibrary: (library: string) => Promise<any>;
    };
  };

  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        countries?: string;
        'for-map'?: string;
        placeholder?: string;
        class?: string;
      }, HTMLElement>;
    }
  }
}

export {};