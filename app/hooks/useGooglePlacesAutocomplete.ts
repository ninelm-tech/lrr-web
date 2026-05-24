// Extend Window type for Google Maps
declare global {
  interface Window {
    google?: any;
  }
}

import { useState, useRef, useEffect } from "react";

export function useGooglePlacesAutocomplete() {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const autocompleteService = useRef<any>(null);
  const geocoder = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Google Maps script with async loading
  useEffect(() => {
    if (typeof window === "undefined" || window.google) return;
    
    const script = document.createElement("script");
    // Use loading=async for best-practice loading pattern
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initialize services when Google Maps is loaded
  useEffect(() => {
    if (typeof window === "undefined" || !window.google) return;

    try {
      if (!autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      }
      if (!geocoder.current) {
        geocoder.current = new window.google.maps.Geocoder();
      }
    } catch (err) {
      console.error("Error initializing Google Places services:", err);
    }
  }, []);

  /**
   * Fetch address suggestions using AutocompleteService
   * Note: Google recommends AutocompleteSuggestion but it's not available yet to all customers
   * AutocompleteService will continue to work and receive bug fixes
   */
  async function fetchSuggestions(query: string) {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (typeof window === "undefined" || !window.google) {
      console.warn("Google Maps not loaded yet");
      return;
    }

    try {
      if (!autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      }

      // Use AutocompleteService to get predictions
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: ["ng"] }, // Restrict to Nigeria
        },
        (predictions: any[], status: string) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
          } else if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn("Autocomplete status:", status);
          }
          setSuggestions(predictions || []);
        }
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Autocomplete request was cancelled");
      } else {
        console.error("Error fetching suggestions:", err);
      }
      setSuggestions([]);
    }
  }

  function handleAddressChange(value: string) {
    setAddress(value);
    
    if (value.length > 2) {
      // Debounce the search
      const timeoutId = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }

  /**
   * Select a suggestion and get coordinates
   */
  function selectSuggestion(suggestion: any) {
    const placeId = suggestion.place_id || suggestion.placeId;
    setAddress(suggestion.description || suggestion.mainText);
    setSuggestions([]);

    if (typeof window === "undefined" || !window.google) return;

    try {
      if (!geocoder.current) {
        geocoder.current = new window.google.maps.Geocoder();
      }

      // Use Geocoder to get detailed location info including coordinates
      geocoder.current.geocode(
        { placeId: placeId },
        (results: any[], status: string) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location;
            setLatLng({
              lat: location.lat(),
              lng: location.lng(),
            });
          } else {
            console.error("Geocoding status:", status);
          }
        }
      );
    } catch (err) {
      console.error("Error selecting suggestion:", err);
    }
  }

  return {
    address,
    setAddress: handleAddressChange,
    suggestions,
    selectSuggestion,
    latLng,
  };
}
