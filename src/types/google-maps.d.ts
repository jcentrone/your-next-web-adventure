declare global {
  interface Window {
    google: {
      maps: {
        Map: new (
          element: HTMLElement,
          options?: any
        ) => any;
        Marker: new (
          options?: any
        ) => any;
        DirectionsService: new () => any;
        DirectionsRenderer: new (
          options?: any
        ) => any;
        Geocoder: new () => any;
        OverlayView: new () => any;
        SymbolPath: {
          CIRCLE: any;
          BACKWARD_CLOSED_ARROW: any;
          BACKWARD_OPEN_ARROW: any;
          FORWARD_CLOSED_ARROW: any;
          FORWARD_OPEN_ARROW: any;
        };
        TravelMode: {
          DRIVING: any;
          WALKING: any;
          BICYCLING: any;
          TRANSIT: any;
        };
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
      Map: new (
        element: HTMLElement,
        options?: any
      ) => any;
      Marker: new (
        options?: any
      ) => any;
      DirectionsService: new () => any;
      DirectionsRenderer: new (
        options?: any
      ) => any;
      Geocoder: new () => any;
      OverlayView: new () => any;
      SymbolPath: {
        CIRCLE: any;
        BACKWARD_CLOSED_ARROW: any;
        BACKWARD_OPEN_ARROW: any;
        FORWARD_CLOSED_ARROW: any;
        FORWARD_OPEN_ARROW: any;
      };
      TravelMode: {
        DRIVING: any;
        WALKING: any;
        BICYCLING: any;
        TRANSIT: any;
      };
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

  namespace google.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface MapPanes {
      floatPane?: HTMLElement;
      mapPane?: HTMLElement;
      markerLayer?: HTMLElement;
      overlayLayer?: HTMLElement;
      overlayMouseTarget?: HTMLElement;
    }

    class OverlayView {
      constructor();
      onAdd(): void;
      draw(): void;
      onRemove(): void;
      setMap(map: any): void;
      getMap(): any;
      getPanes(): MapPanes | null;
      getProjection(): any;
    }
  }

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