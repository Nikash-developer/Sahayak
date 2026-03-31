import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Map as MapIcon, Globe, Mountain, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

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
  userLocation?: [number, number];
  className?: string;
  interactive?: boolean;
  onMapClick?: (latlng: [number, number]) => void;
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string | null;
}

type MapLayer = 'streets' | 'satellite' | 'terrain';

const MAP_LAYERS: Record<MapLayer, { url: string, attribution: string, icon: any, label: string }> = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    icon: MapIcon,
    label: 'Streets'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    icon: Globe,
    label: 'Satellite'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    icon: Mountain,
    label: 'Terrain'
  }
};

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function MapEvents({ onClick }: { onClick?: (latlng: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onClick) return;
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onClick([e.latlng.lat, e.latlng.lng]);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onClick]);
  
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  center = [40.7128, -74.0060] as [number, number], 
  zoom = 13, 
  markers = [], 
  route = [],
  userLocation,
  className = "w-full h-full",
  interactive = true,
  onMapClick,
  onMarkerClick,
  selectedMarkerId: controlledSelectedMarkerId
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (controlledSelectedMarkerId !== undefined) {
      setSelectedMarkerId(controlledSelectedMarkerId);
    }
  }, [controlledSelectedMarkerId]);

  useEffect(() => {
    if (selectedMarkerId && markerRefs.current[selectedMarkerId]) {
      markerRefs.current[selectedMarkerId].openPopup();
    }
  }, [selectedMarkerId]);
  
  const getMarkerIcon = (severity?: string, isSelected?: boolean) => {
    let color = '#006D6D'; // Default teal
    if (severity === 'high') color = '#ef4444'; // Red
    if (severity === 'medium') color = '#f97316'; // Orange

    const size = isSelected ? 24 : 16;
    const borderSize = isSelected ? 4 : 3;

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderSize}px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); transition: all 0.2s ease-out;"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const getUserIcon = () => {
    return L.divIcon({
      className: 'user-location-icon',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #3b82f6; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.4; }
            70% { transform: scale(2.5); opacity: 0; }
            100% { transform: scale(1); opacity: 0; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className={cn("relative", className)} style={{ minHeight: '100%', minWidth: '100%' }}>
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-teal-600 transition-all border border-slate-100"
          title="Switch Map Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
        
        {showLayerMenu && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
            {(Object.keys(MAP_LAYERS) as MapLayer[]).map((layerKey) => {
              const layer = MAP_LAYERS[layerKey];
              const Icon = layer.icon;
              return (
                <button
                  key={layerKey}
                  onClick={() => {
                    setActiveLayer(layerKey);
                    setShowLayerMenu(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    activeLayer === layerKey 
                      ? "bg-teal-50 text-teal-700" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {layer.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

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
        <MapEvents onClick={onMapClick} />
        <TileLayer
          attribution={MAP_LAYERS[activeLayer].attribution}
          url={MAP_LAYERS[activeLayer].url}
        />
        
        {userLocation && (
          <Marker position={userLocation} icon={getUserIcon()}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            ref={(el) => { if (el) markerRefs.current[marker.id] = el; }}
            icon={getMarkerIcon(marker.severity, selectedMarkerId === marker.id)}
            eventHandlers={{
              click: () => {
                setSelectedMarkerId(marker.id);
                if (onMarkerClick) onMarkerClick(marker.id);
              },
            }}
          >
            <Popup onClose={() => setSelectedMarkerId(null)}>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    marker.severity === 'high' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  )}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{marker.title}</h3>
                </div>
                
                {marker.description && (
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {marker.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {marker.severity && (
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                      marker.severity === 'high' ? 'bg-red-100 text-red-600' : 
                      marker.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 
                      'bg-teal-100 text-teal-600'
                    )}>
                      {marker.severity}
                    </span>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hazard-reports?id=${marker.id}`);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
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
