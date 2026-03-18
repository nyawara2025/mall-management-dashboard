import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensity]
}

export const HeatmapLayer = ({ points }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create the heat layer
    // @ts-ignore - L.heatLayer might not be recognized by tsc without full types
    const heatLayer = (L as any).heatLayer(points, {
      radius: 35,
      blur: 15,
      maxZoom: 10,
      minOpacity: 0.5, // Ensure it's not transparent
      zIndex: 1000     // Force it to the top
    }).addTo(map);

    // Cleanup: remove the layer when component unmounts
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null; // This component doesn't render anything itself
};

