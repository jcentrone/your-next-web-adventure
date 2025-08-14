declare global {
  interface Window {
    google: {
      maps: {
        places: {
          PlaceAutocompleteElement: {
            new (): PlaceAutocompleteElement;
          };
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
  }

  interface PlaceAutocompleteElement extends HTMLElement {
    componentRestrictions?: {
      country?: string | string[];
    };
    types?: string[];
    fields?: string[];
    addEventListener(
      type: 'gmp-placeselect',
      listener: (event: PlaceSelectEvent) => void
    ): void;
    removeEventListener(
      type: 'gmp-placeselect', 
      listener: (event: PlaceSelectEvent) => void
    ): void;
  }

  interface PlaceSelectEvent extends CustomEvent {
    detail: {
      place: {
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
  }

  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<PlaceAutocompleteElement>,
        PlaceAutocompleteElement
      > & {
        types?: string[];
        fields?: string[];
        'component-restrictions'?: string;
        placeholder?: string;
        value?: string;
      };
    }
  }
}

export {};