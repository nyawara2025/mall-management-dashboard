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
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    // Cleanup: remove the layer when component unmounts
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null; // This component doesn't render anything itself
};

