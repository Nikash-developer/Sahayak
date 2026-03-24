import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  route?: [number, number][];
  className?: string;
  interactive?: boolean;
}

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  center = [40.7128, -74.0060] as [number, number], 
  zoom = 13, 
  markers = [], 
  route = [],
  className = "w-full h-full",
  interactive = true
}) => {
  
  const getMarkerIcon = (severity?: string) => {
    let color = '#006D6D'; // Default teal
    if (severity === 'high') color = '#ef4444'; // Red
    if (severity === 'medium') color = '#f97316'; // Orange

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <div className={className} style={{ minHeight: '100%', minWidth: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={interactive}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        className="w-full h-full z-0"
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={getMarkerIcon(marker.severity)}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{marker.title}</h3>
                {marker.description && <p className="text-xs text-gray-600 mt-1">{marker.description}</p>}
                {marker.severity && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    marker.severity === 'high' ? 'bg-red-100 text-red-600' : 
                    marker.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 
                    'bg-teal-100 text-teal-600'
                  }`}>
                    {marker.severity} Severity
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="#006D6D" 
            weight={6} 
            opacity={0.7} 
            lineCap="round"
          />
        )}

        <Circle 
          center={center} 
          radius={500} 
          pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} 
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
