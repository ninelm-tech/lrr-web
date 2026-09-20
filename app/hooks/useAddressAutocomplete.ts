import React, { useState } from "react";

export function useAddressAutocomplete() {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);

  async function fetchSuggestions(query: string) {
    // Example using Mapbox Places API (replace with your API key)
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!MAPBOX_TOKEN) return;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    setSuggestions(data.features || []);
  }

  function handleAddressChange(value: string) {
    setAddress(value);
    if (value.length > 2) fetchSuggestions(value);
    else setSuggestions([]);
  }

  function selectSuggestion(suggestion: any) {
    setAddress(suggestion.place_name);
    setLatLng({ lat: suggestion.center[1], lng: suggestion.center[0] });
    setSuggestions([]);
  }

  return {
    address,
    setAddress: handleAddressChange,
    suggestions,
    selectSuggestion,
    latLng,
  };
}
