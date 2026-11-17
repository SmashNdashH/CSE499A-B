import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ZoomIn, ZoomOut, Crosshair, Compass, Layers, Wifi } from 'lucide-react';
import { BuildingFeature, DamageLevel, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineCanvasProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onSelectBuilding: (building: BuildingFeature) => void;
  activeTool: 'select' | 'pan' | 'measure' | 'inspect';
  hiddenBuildingIds: string[];
  activeFilter: 'all' | 'destroyed' | 'damaged' | 'intact';
}

export const SplineCanvas: React.FC<SplineCanvasProps> = ({
  scenario,
  selectedBuilding,
  onSelectBuilding,
  hiddenBuildingIds,
  activeFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Online tiles toggle (off by default per review requirement)
  const [onlineTilesEnabled, setOnlineTilesEnabled] = useState(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map safely with cleanup
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

      const group = L.layerGroup().addTo(map);
      layersGroupRef.current = group;
      mapInstanceRef.current = map;

      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 200);

      return () => {
        clearTimeout(timer);
        map.remove();
        mapInstanceRef.current = null;
        layersGroupRef.current = null;
      };
    } catch (err) {
      console.warn('SplineCanvas Leaflet init warning:', err);
    }
  }, [scenario.id]);

  // Online tile layer effect (Labelled online-tiles option, off by default)
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

  // Update building footprints
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const group = layersGroupRef.current;
    group.clearLayers();

    const getDamageColors = (damage: DamageLevel) => {
      switch (damage) {
        case 'destroyed':
          return { color: '#f43f5e', fill: '#f43f5e', opacity: 0.5 };
        case 'damaged':
          return { color: '#f59e0b', fill: '#f59e0b', opacity: 0.45 };
        case 'intact':
        default:
          return { color: '#10b981', fill: '#10b981', opacity: 0.3 };
      }
    };

    const visibleBuildings = scenario.buildings.filter((b) => {
      if (hiddenBuildingIds.includes(b.id)) return false;
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
      const palette = getDamageColors(b.class_name);

      const bounds: [[number, number], [number, number]] = [
        [lat - dLat, lng - dLng],
        [lat + dLat, lng + dLng]
      ];

      const rect = L.rectangle(bounds, {
        color: isSelected ? '#0084ff' : palette.color,
        weight: isSelected ? 3.5 : 2,
        fillColor: isSelected ? '#0084ff' : palette.fill,
        fillOpacity: isSelected ? 0.75 : palette.opacity,
        dashArray: b.class_name === 'destroyed' ? '4, 4' : undefined
      });

      const tooltipHtml = `
        <div style="
          background: rgba(18, 18, 20, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 6px 10px;
          color: #f1f5f9;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          line-height: 1.4;
        ">
          <div style="font-weight: 700; color: ${isSelected ? '#38bdf8' : palette.color};">
            ${b.id}: ${b.name}
          </div>
          <div style="color: #94a3b8; font-size: 10px;">
            Class: ${b.class_name} · Area: ${b.area_px.toLocaleString()} px
          </div>
        </div>
      `;

      rect.bindTooltip(tooltipHtml, {
        permanent: false,
        direction: 'top',
        opacity: 1,
        className: 'spline-map-tooltip'
      });

      rect.on('click', () => {
        sound.playRadioChirp();
        onSelectBuilding(b);
      });

      rect.addTo(group);
    });
  }, [scenario, selectedBuilding, activeFilter, hiddenBuildingIds]);

  // Center smoothly on selected building
  useEffect(() => {
    if (selectedBuilding && mapInstanceRef.current && selectedBuilding.lat !== undefined && selectedBuilding.lng !== undefined) {
      mapInstanceRef.current.flyTo([selectedBuilding.lat, selectedBuilding.lng], 18, {
        duration: 0.5
      });
    }
  }, [selectedBuilding]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#090a0f]">
      {/* Leaflet Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 transition-all duration-300"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Crosshair / Reticle Grid in Center */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-25">
        <div className="w-12 h-12 border border-white/40 rounded-full" />
        <div className="absolute w-24 h-px bg-white/40" />
        <div className="absolute h-24 w-px bg-white/40" />
      </div>

      {/* Online Tiles Toggle Pill (Top Left) */}
      <div className="absolute top-18 left-3 z-20 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-xs font-mono shadow-2xl">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Wifi className="w-3.5 h-3.5 text-amber-400" />
          <span>Online satellite basemap (requires internet)</span>
        </div>
        <button
          onClick={() => setOnlineTilesEnabled(!onlineTilesEnabled)}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors border ${
            onlineTilesEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          {onlineTilesEnabled ? 'ON' : 'OFF (Default)'}
        </button>
      </div>

      {/* Persistent Watermark Banner (Top Right) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none px-3 py-1 rounded-xl bg-[#121214]/90 border border-amber-400/40 text-amber-300 text-xs font-mono">
        Illustration: not real data
      </div>

      {/* Floating Canvas Navigation Controls */}
      <div className="absolute bottom-18 left-3 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sound.playRadioChirp();
            mapInstanceRef.current?.flyTo([scenario.centerLat, scenario.centerLng], scenario.defaultZoom, {
              duration: 0.6
            });
          }}
          className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
          title="Reset to Center"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial Compass Widget */}
      <div className="absolute bottom-32 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-slate-300 shadow-2xl">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>GSD 0.3m/px equivalent · Illustration: not real data</span>
      </div>
    </div>
  );
};
