"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window { google?: any; }
}

interface ServiceRadiusMapProps {
  lat: number;
  lng: number;
  radiusKm: number;
  mapsReady: boolean;
  height?: number;
}

/**
 * Shows an operator's base location with a circle overlay for their service
 * radius, so "50 km" reads as an actual coverage area instead of an abstract
 * number. Reuses the same Google Maps script already loaded by
 * useGooglePlacesAutocomplete — Map/Circle are core classes, no extra
 * library or billing bucket needed beyond what's already requested.
 */
export default function ServiceRadiusMap({ lat, lng, radiusKm, mapsReady, height = 220 }: ServiceRadiusMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || !window.google?.maps) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) || radiusKm <= 0) return;

    const center = { lat, lng };

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center,
        zoom: 10,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
      });
      markerRef.current = new window.google.maps.Marker({ position: center, map: mapRef.current });
      circleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center,
        radius: radiusKm * 1000,
        fillColor: "#003DB4",
        fillOpacity: 0.12,
        strokeColor: "#003DB4",
        strokeOpacity: 0.6,
        strokeWeight: 2,
      });
    } else {
      mapRef.current.setCenter(center);
      markerRef.current.setPosition(center);
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusKm * 1000);
    }

    // Fit the viewport to the circle so the whole coverage area is visible.
    const bounds = circleRef.current.getBounds();
    if (bounds) mapRef.current.fitBounds(bounds);
  }, [mapsReady, lat, lng, radiusKm]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) || radiusKm <= 0) {
    return null;
  }

  return (
    <div
      ref={mapDivRef}
      style={{ width: "100%", height, borderRadius: 10, border: "1px solid #dde8f8", overflow: "hidden" }}
    />
  );
}
