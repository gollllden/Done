import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;
let loadPromise = null;

export const useGoogleMapsLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const loadAttempted = useRef(false);

  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError(new Error('Google Maps API key is not configured'));
      setIsLoaded(false);
      return;
    }

    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      });
    }

    if (!loadPromise) {
      loadPromise = loaderInstance
        .load()
        .then(() => {
          setIsLoaded(true);
          setError(null);
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Failed to load Google Maps API';
          setError(new Error(message));
          setIsLoaded(false);
          loadPromise = null;
        });
    } else {
      loadPromise
        .then(() => {
          setIsLoaded(true);
          setError(null);
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Failed to load Google Maps API';
          setError(new Error(message));
          setIsLoaded(false);
        });
    }
  }, []);

  return { isLoaded, error };
};
