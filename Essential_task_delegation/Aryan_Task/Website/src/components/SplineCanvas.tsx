import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ZoomIn, ZoomOut, Crosshair, Compass, Navigation } from 'lucide-react';
import { BuildingFeature, DamageLevel, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineCanvasProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onSelectBuilding: (building: BuildingFeature) => void;
  activeTool: 'select' | 'thermal' | 'ingress' | 'radar';
  hiddenBuildingIds: string[];
  activeFilter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress';
}

export const SplineCanvas: React.FC<SplineCanvasProps> = ({
  scenario,
  selectedBuilding,
  onSelectBuilding,
  activeTool,
  hiddenBuildingIds,
  activeFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

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

      // Esri World Imagery (High-Res 0.3m orbital photography)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri World Imagery'
        }
      ).addTo(map);

      const group = L.layerGroup().addTo(map);
      layersGroupRef.current = group;
      mapInstanceRef.current = map;

      // Force recalculation of container dimensions
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

  // Update building footprints and route overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const group = layersGroupRef.current;
    group.clearLayers();

    const getDamageColors = (damage: DamageLevel) => {
      switch (damage) {
        case 'destroyed':
          return { color: '#f43f5e', fill: '#f43f5e', opacity: 0.5 };
        case 'major-damage':
          return { color: '#f59e0b', fill: '#f59e0b', opacity: 0.45 };
        case 'minor-damage':
          return { color: '#eab308', fill: '#eab308', opacity: 0.35 };
        case 'no-damage':
        default:
          return { color: '#10b981', fill: '#10b981', opacity: 0.3 };
      }
    };

    // Filter buildings by current filter & hidden list
    const visibleBuildings = scenario.buildings.filter((b) => {
      if (hiddenBuildingIds.includes(b.id)) return false;
      if (activeFilter === 'destroyed') return b.damage === 'destroyed';
      if (activeFilter === 'major') return b.damage === 'major-damage';
      if (activeFilter === 'voids' || activeTool === 'radar') return b.voidLikelihood === 'High';
      if (activeFilter === 'ingress') return b.damage === 'no-damage' || b.damage === 'minor-damage';
      return true;
    });

    visibleBuildings.forEach((b) => {
      if (!b.polygon) return;

      const isSelected = selectedBuilding?.id === b.id;
      const palette = getDamageColors(b.damage);

      // Building footprint polygon on satellite imagery
      const polygon = L.polygon(b.polygon, {
        color: isSelected ? '#0084ff' : palette.color,
        weight: isSelected ? 3.5 : 2,
        fillColor: isSelected ? '#0084ff' : palette.fill,
        fillOpacity: isSelected ? 0.75 : palette.opacity,
        dashArray: b.damage === 'destroyed' ? '4, 4' : undefined
      });

      // Spline-styled floating tooltip
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
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          line-height: 1.4;
        ">
          <div style="font-weight: 700; color: ${isSelected ? '#38bdf8' : palette.color};">
            ${b.id}: ${b.name}
          </div>
          <div style="color: #94a3b8; font-size: 10px;">
            ${b.collapseType} · ${b.floors} Storeys · Void: ${b.voidLikelihood}
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipHtml, {
        permanent: false,
        direction: 'top',
        opacity: 1,
        className: 'spline-map-tooltip'
      });

      polygon.on('click', () => {
        sound.playSonarPing();
        onSelectBuilding(b);
      });

      polygon.addTo(group);

      // Void Radar Rings
      if (b.voidLikelihood === 'High' && (activeTool === 'radar' || activeFilter === 'voids' || isSelected)) {
        const radarMarker = L.circleMarker([b.lat, b.lng], {
          radius: 16,
          color: '#38bdf8',
          weight: 1.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.25,
          dashArray: '3, 4'
        });
        radarMarker.addTo(group);
      }
    });

    // Ingress Route Alpha Polyline (Avenue Central)
    if (activeTool === 'ingress' || activeFilter === 'ingress' || activeFilter === 'all') {
      const ingressCoords: [number, number][] = [
        [scenario.centerLat + 0.002, scenario.centerLng - 0.003],
        [scenario.centerLat + 0.0014, scenario.centerLng - 0.0008],
        [scenario.centerLat + 0.0006, scenario.centerLng + 0.0002],
        [scenario.centerLat - 0.0008, scenario.centerLng + 0.0012]
      ];

      const ingressPolyline = L.polyline(ingressCoords, {
        color: '#10b981',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.9
      });

      ingressPolyline.bindTooltip(`
        <div style="
          background: rgba(18, 18, 20, 0.95);
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 8px;
          padding: 4px 8px;
          color: #34d399;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          font-weight: 700;
        ">
          Ingress Route Alpha (Cleared)
        </div>
      `, { permanent: false, direction: 'center' });

      ingressPolyline.addTo(group);

      // Route entry waypoint marker
      const waypoint = L.circleMarker(ingressCoords[0], {
        radius: 6,
        color: '#10b981',
        weight: 2,
        fillColor: '#ffffff',
        fillOpacity: 1
      });
      waypoint.addTo(group);
    }
  }, [scenario, selectedBuilding, activeFilter, activeTool, hiddenBuildingIds]);

  // Center smoothly on selected building
  useEffect(() => {
    if (selectedBuilding && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedBuilding.lat, selectedBuilding.lng], 18, {
        duration: 0.5
      });
    }
  }, [selectedBuilding]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#090a0f]">
      {/* Real Esri Satellite Leaflet Canvas */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 transition-all duration-300 ${
          activeTool === 'thermal'
            ? 'filter contrast-150 saturate-150 hue-rotate-190 brightness-90'
            : ''
        }`}
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Crosshair / Reticle Grid in Center */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-25">
        <div className="w-12 h-12 border border-white/40 rounded-full" />
        <div className="absolute w-24 h-px bg-white/40" />
        <div className="absolute h-24 w-px bg-white/40" />
      </div>

      {/* Thermal Barrier Simulation Notice when tool is active */}
      {activeTool === 'thermal' && (
        <div className="absolute top-18 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none px-3 py-1.5 rounded-2xl bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-300 text-xs font-mono shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>FLIR THERMAL SIM: Multi-slab concrete attenuation active. Infrared blind spot.</span>
        </div>
      )}

      {/* Floating Canvas Navigation Controls (Spline Bottom-Left Style) */}
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
          title="Reset to Sector Center"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial Compass Widget (Bottom-Left above controls) */}
      <div className="absolute bottom-32 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-slate-300 shadow-2xl">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>GSD 0.3m/px · 37.58° N</span>
      </div>
    </div>
  );
};
