import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Layers,
  Activity,
  Flame,
  Route
} from 'lucide-react';
import { BuildingFeature, DamageLevel, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface ResponderMapProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onSelectBuilding: (building: BuildingFeature) => void;
  activeFilter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress';
  setActiveFilter: (filter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress') => void;
  activeSector: string | null;
}

export const ResponderMap: React.FC<ResponderMapProps> = ({
  scenario,
  selectedBuilding,
  onSelectBuilding,
  activeFilter,
  setActiveFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<L.LayerGroup | null>(null);

  const [thermalMode, setThermalMode] = useState(false);

  // Initialize and clean up Leaflet Map safely
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

      // Real Satellite Basemap (Esri World Imagery)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri World Imagery'
        }
      ).addTo(map);

      const polygonGroup = L.layerGroup().addTo(map);
      polygonLayersRef.current = polygonGroup;
      mapInstanceRef.current = map;

      // Force Leaflet to compute geometry
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

  // Update building footprints and route when scenario, filter, or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayersRef.current) return;

    const group = polygonLayersRef.current;
    group.clearLayers();

    const getColors = (damage: DamageLevel) => {
      switch (damage) {
        case 'destroyed':
          return { color: '#f43f5e', fill: '#f43f5e', opacity: 0.55 };
        case 'major-damage':
          return { color: '#f59e0b', fill: '#f59e0b', opacity: 0.5 };
        case 'minor-damage':
          return { color: '#eab308', fill: '#eab308', opacity: 0.4 };
        case 'no-damage':
        default:
          return { color: '#10b981', fill: '#10b981', opacity: 0.35 };
      }
    };

    // Filter buildings
    const visibleBuildings = scenario.buildings.filter((b) => {
      if (activeFilter === 'destroyed') return b.damage === 'destroyed';
      if (activeFilter === 'major') return b.damage === 'major-damage';
      if (activeFilter === 'voids') return b.voidLikelihood === 'High';
      if (activeFilter === 'ingress') return b.damage === 'no-damage' || b.damage === 'minor-damage';
      return true;
    });

    visibleBuildings.forEach((b) => {
      if (!b.polygon) return;

      const isSelected = selectedBuilding?.id === b.id;
      const palette = getColors(b.damage);

      // Building footprint polygon on satellite imagery
      const polygon = L.polygon(b.polygon, {
        color: isSelected ? '#38bdf8' : palette.color,
        weight: isSelected ? 3.5 : 2,
        fillColor: palette.fill,
        fillOpacity: isSelected ? 0.8 : palette.opacity,
        dashArray: b.damage === 'destroyed' ? '4, 4' : undefined
      });

      // Simple, crisp military-style tooltip
      const tooltipHtml = `
        <div style="font-family: monospace; font-size: 11px; padding: 3px 6px; background: rgba(15,23,42,0.95); color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 6px;">
          <strong style="color: ${palette.color};">${b.id}: ${b.name}</strong><br/>
          <span>${b.collapseType} · Grade ${b.damage.toUpperCase()}</span>
        </div>
      `;

      polygon.bindTooltip(tooltipHtml, {
        permanent: false,
        direction: 'top',
        opacity: 0.95
      });

      polygon.on('click', () => {
        sound.playSonarPing();
        onSelectBuilding(b);
      });

      polygon.addTo(group);

      // High void air pocket radar ring
      if (b.voidLikelihood === 'High') {
        const radar = L.circleMarker([b.lat, b.lng], {
          radius: 14,
          color: '#38bdf8',
          weight: 1.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.2,
          dashArray: '3, 3'
        });
        radar.addTo(group);
      }
    });

    // Ingress route polyline
    const ingressPath: [number, number][] = [
      [scenario.centerLat + 0.002, scenario.centerLng - 0.003],
      [scenario.centerLat + 0.0015, scenario.centerLng],
      [scenario.centerLat, scenario.centerLng],
      [scenario.centerLat - 0.0015, scenario.centerLng + 0.001]
    ];

    L.polyline(ingressPath, {
      color: '#10b981',
      weight: 3,
      dashArray: '6, 6',
      opacity: 0.85
    }).addTo(group);
  }, [scenario, selectedBuilding, activeFilter]);

  // Center on building when clicked
  useEffect(() => {
    if (selectedBuilding && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedBuilding.lat, selectedBuilding.lng], 18, {
        duration: 0.6
      });
    }
  }, [selectedBuilding]);

  return (
    <div className="relative w-full h-full flex flex-col rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none min-h-[540px]">
      
      {/* Top Map Bar: Simplified & Clear */}
      <div className="z-20 p-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>{scenario.location}</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400">0.3m Satellite (Esri Maxar)</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setThermalMode(!thermalMode)}
            className={`px-3 py-1 rounded-xl transition-colors border ${
              thermalMode
                ? 'bg-rose-500 text-white border-rose-400 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {thermalMode ? 'Thermal FLIR ON' : 'Thermal FLIR Sim'}
          </button>
        </div>
      </div>

      {/* Main Map Tile Container */}
      <div className="relative flex-1 w-full min-h-[480px] sm:min-h-[560px] bg-slate-950 overflow-hidden">
        
        {/* Leaflet DOM Anchor with guaranteed height */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full z-0 transition-all ${
            thermalMode ? 'filter contrast-150 hue-rotate-180 brightness-75' : ''
          }`}
          style={{ minHeight: '520px', height: '100%' }}
        />

        {/* Crosshair Center Reticle */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-20">
          <div className="w-10 h-10 border border-slate-300 rounded-full" />
          <div className="absolute w-16 h-px bg-slate-300" />
          <div className="absolute h-16 w-px bg-slate-300" />
        </div>

        {/* Simplified Floating Filter Pills (Top Left) */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-lg text-xs font-mono">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeFilter === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All ({scenario.totalBuildings})
          </button>

          <button
            onClick={() => setActiveFilter('destroyed')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeFilter === 'destroyed'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            Destroyed ({scenario.damageCounts.destroyed})
          </button>

          <button
            onClick={() => setActiveFilter('major')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeFilter === 'major'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            Major ({scenario.damageCounts.major})
          </button>

          <button
            onClick={() => setActiveFilter('voids')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeFilter === 'voids'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-sky-400 hover:text-sky-300'
            }`}
          >
            Air Voids (3)
          </button>

          <button
            onClick={() => setActiveFilter('ingress')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeFilter === 'ingress'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Ingress Route
          </button>
        </div>

        {/* Zoom & Center Controls (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              mapInstanceRef.current?.flyTo([scenario.centerLat, scenario.centerLng], scenario.defaultZoom);
            }}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800 transition-colors"
            title="Center Sector"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Simple Legend on Bottom */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-rose-500" /> Destroyed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-500" /> Major
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-sky-400" /> Air Void Radar
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Ingress
          </span>
        </div>
      </div>
    </div>
  );
};
