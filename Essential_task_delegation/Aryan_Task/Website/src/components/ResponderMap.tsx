import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Layers,
  Activity,
  Wifi
} from 'lucide-react';
import { BuildingFeature, DamageLevel, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface ResponderMapProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onSelectBuilding: (building: BuildingFeature) => void;
  activeFilter: 'all' | 'destroyed' | 'damaged' | 'intact';
  setActiveFilter: (filter: 'all' | 'destroyed' | 'damaged' | 'intact') => void;
  activeSector: string | null;
}

export const ResponderMap: React.FC<ResponderMapProps> = ({
  scenario,
  selectedBuilding,
  onSelectBuilding,
  activeFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<L.LayerGroup | null>(null);

  // Online satellite tiles (labelled option, off by default per review requirement)
  const [onlineTilesEnabled, setOnlineTilesEnabled] = useState(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current;
    if ((container as unknown as { _leaflet_id?: string | null })._leaflet_id != null) {
      (container as unknown as { _leaflet_id?: string | null })._leaflet_id = null;
    }

    try {
      const map = L.map(container, {
        center: [scenario.centerLat, scenario.centerLng],
        zoom: scenario.defaultZoom,
        zoomControl: false,
        attributionControl: false
      });

      const polygonGroup = L.layerGroup().addTo(map);
      polygonLayersRef.current = polygonGroup;
      mapInstanceRef.current = map;

      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);

      return () => {
        clearTimeout(timer);
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (e) {
      console.warn('Map initialization error:', e);
    }
  }, [scenario.id]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (onlineTilesEnabled) {
      if (!tileLayerRef.current) {
        // Online satellite basemap (requires internet) - labelled online-tiles option
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Online satellite basemap (requires internet)'
          }
        );
      }
      tileLayerRef.current.addTo(map);
    } else {
      if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
        map.removeLayer(tileLayerRef.current);
      }
    }
  }, [onlineTilesEnabled]);

  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayersRef.current) return;

    const group = polygonLayersRef.current;
    group.clearLayers();

    const getColors = (damage: DamageLevel) => {
      switch (damage) {
        case 'destroyed':
          return { color: '#f43f5e', fill: '#f43f5e', fillOpacity: 0.5 };
        case 'damaged':
          return { color: '#f59e0b', fill: '#f59e0b', fillOpacity: 0.45 };
        case 'intact':
        default:
          return { color: '#10b981', fill: '#10b981', fillOpacity: 0.35 };
      }
    };

    const visibleBuildings = scenario.buildings.filter((b) => {
      if (activeFilter === 'destroyed') return b.class_name === 'destroyed';
      if (activeFilter === 'damaged') return b.class_name === 'damaged';
      if (activeFilter === 'intact') return b.class_name === 'intact';
      return true;
    });

    visibleBuildings.forEach((b) => {
      const lat = b.lat ?? scenario.centerLat;
      const lng = b.lng ?? scenario.centerLng;
      const dLat = 0.0003;
      const dLng = 0.0003;

      const isSelected = selectedBuilding?.id === b.id;
      const colors = getColors(b.class_name);

      const bounds: [[number, number], [number, number]] = [
        [lat - dLat, lng - dLng],
        [lat + dLat, lng + dLng]
      ];

      const rect = L.rectangle(bounds, {
        color: isSelected ? '#38bdf8' : colors.color,
        weight: isSelected ? 3 : 1.5,
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.8 : colors.fillOpacity
      });

      rect.bindTooltip(`
        <div style="background: rgba(15, 23, 42, 0.95); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15); color: #fff; font-family: ui-monospace, monospace; font-size: 11px;">
          <strong style="color: ${colors.color}">${b.id}: ${b.name}</strong><br/>
          <span>Class: ${b.class_name} · ${b.area_px.toLocaleString()} px</span>
        </div>
      `, { permanent: false, direction: 'top' });

      rect.on('click', () => {
        sound.playRadioChirp();
        onSelectBuilding(b);
      });

      rect.addTo(group);
    });
  }, [scenario, selectedBuilding, activeFilter]);

  return (
    <div className="relative w-full h-full bg-[#090a0f] overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Online Tiles Toggle Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs font-mono text-slate-200">
        <Wifi className="w-3.5 h-3.5 text-amber-400" />
        <span>Online satellite basemap (requires internet)</span>
        <button
          onClick={() => setOnlineTilesEnabled(!onlineTilesEnabled)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            onlineTilesEnabled ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {onlineTilesEnabled ? 'ON' : 'OFF (Default)'}
        </button>
      </div>

      {/* Watermark Banner */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-xl bg-slate-900/90 border border-amber-400/40 text-amber-300 text-xs font-mono">
        Illustration: not real data
      </div>
    </div>
  );
};
