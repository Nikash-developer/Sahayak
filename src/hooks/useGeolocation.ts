import { useState, useEffect } from 'react';

interface GeolocationState {
  coordinates: [number, number] | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (autoStart = true) => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: autoStart,
  });

  useEffect(() => {
    if (!autoStart) return;

    if (!("geolocation" in navigator)) {
      setState(prev => ({ ...prev, error: "Geolocation not supported", loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: [position.coords.latitude, position.coords.longitude],
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [autoStart]);

  return state;
};
