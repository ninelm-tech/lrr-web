declare global {
  interface Window { google?: any; }
}

import { useState, useRef, useEffect, useCallback } from "react";

export function useGooglePlacesAutocomplete() {
  const [address,     setAddress]     = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [latLng,      setLatLng]      = useState<{ lat: number; lng: number } | null>(null);
  const [mapsReady,   setMapsReady]   = useState(false);

  const autocompleteService = useRef<any>(null);
  const geocoder            = useRef<any>(null);
  const debounceRef         = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load Google Maps script once ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already fully loaded
    if (window.google?.maps?.places) {
      initServices();
      setMapsReady(true);
      return;
    }

    // Script tag already in DOM (strict-mode double-mount guard)
    if (document.querySelector('script[data-gmaps]')) return;

    const script = document.createElement("script");
    script.dataset.gmaps = "1";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      initServices();
      setMapsReady(true);
    };

    script.onerror = () => console.error("Failed to load Google Maps script");
    document.head.appendChild(script);
  }, []);

  function initServices() {
    try {
      if (!autocompleteService.current) {
        autocompleteService.current = new window.google!.maps.places.AutocompleteService();
      }
      if (!geocoder.current) {
        geocoder.current = new window.google!.maps.Geocoder();
      }
    } catch (err) {
      console.error("Error initialising Google Places services:", err);
    }
  }

  // ── Fetch predictions ────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback((query: string) => {
    if (!query || query.length < 2) { setSuggestions([]); return; }
    if (!mapsReady || !autocompleteService.current) return;

    autocompleteService.current.getPlacePredictions(
      { input: query, componentRestrictions: { country: ["ng"] } },
      (predictions: any[], status: string) => {
        const ok = window.google?.maps?.places?.PlacesServiceStatus?.OK;
        if (status === ok && predictions?.length) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      },
    );
  }, [mapsReady]);

  // ── Debounced address change handler ─────────────────────────────────────────
  function handleAddressChange(value: string) {
    setAddress(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length > 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setSuggestions([]);
    }
  }

  // ── Geocode a selected suggestion → lat/lng ──────────────────────────────────
  function selectSuggestion(suggestion: any) {
    setAddress(suggestion.description || suggestion.mainText || "");
    setSuggestions([]);

    if (!mapsReady || !geocoder.current) return;

    geocoder.current.geocode(
      { placeId: suggestion.place_id || suggestion.placeId },
      (results: any[], status: string) => {
        if (status === "OK" && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          setLatLng({ lat: loc.lat(), lng: loc.lng() });
        } else {
          console.error("Geocoding failed:", status);
        }
      },
    );
  }

  return {
    address,
    setAddress: handleAddressChange,
    suggestions,
    selectSuggestion,
    latLng,
    mapsReady,
  };
}
