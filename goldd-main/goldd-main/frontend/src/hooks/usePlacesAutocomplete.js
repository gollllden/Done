import { useEffect, useRef, useState } from 'react';
import { useGoogleMapsLoader } from './useGoogleMapsLoader';

export const usePlacesAutocomplete = (options = {}) => {
  const { isLoaded, error: loadError } = useGoogleMapsLoader();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const listenerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const {
    onPlaceSelected,
    countries = ['ca'],
    fields = ['address_components', 'formatted_address', 'geometry', 'name'],
  } = options;

  useEffect(() => {
    if (!isLoaded || !inputRef.current) {
      setIsReady(false);
      return;
    }

    try {
      if (typeof window.google === 'undefined' || !window.google.maps) {
        setError(new Error('Google Maps API not available'));
        setIsReady(false);
        return;
      }

      const autocompleteOptions = {
        fields,
        componentRestrictions: {
          country: countries,
        },
        strictBounds: false,
      };

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        autocompleteOptions
      );

      const handlePlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && onPlaceSelected) {
          onPlaceSelected(place);
        }
      };

      listenerRef.current = autocompleteRef.current.addListener(
        'place_changed',
        handlePlaceChanged
      );

      setIsReady(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize autocomplete';
      setError(new Error(message));
      setIsReady(false);
    }

    return () => {
      if (listenerRef.current && window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(listenerRef.current);
      }
      listenerRef.current = null;
      autocompleteRef.current = null;
    };
  }, [isLoaded, onPlaceSelected, countries, fields]);

  useEffect(() => {
    if (loadError && !error) {
      setError(loadError);
    }
  }, [loadError, error]);

  return { inputRef, isReady, error };
};
