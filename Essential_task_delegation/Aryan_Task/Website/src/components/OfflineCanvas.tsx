import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Compass, 
  Layers, 
  Eye, 
  Wifi, 
  WifiOff, 
  Route, 
  Radar, 
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { BuildingFeature, DamageLevel, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface OfflineCanvasProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onSelectBuilding: (building: BuildingFeature) => void;
  activeTool: 'select' | 'thermal' | 'ingress' | 'radar';
  hiddenBuildingIds: string[];
  activeFilter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress';
  isOfflineOnly: boolean;
  onToggleOffline: () => void;
  show3DCity: boolean;
  onToggle3DCity: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showBeforeAfter: boolean;
  onToggleBeforeAfter: () => void;
}

export const OfflineCanvas: React.FC<OfflineCanvasProps> = ({
  scenario,
  selectedBuilding,
  onSelectBuilding,
  activeTool,
  hiddenBuildingIds,
  activeFilter,
  isOfflineOnly,
  onToggleOffline,
  show3DCity,
  onToggle3DCity,
  showHeatmap,
  onToggleHeatmap,
  showBeforeAfter,
  onToggleBeforeAfter
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Pan and Zoom viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Before/After comparison slider position (0 to 100 percentage)
  const [sliderPos, setSliderPos] = useState(50);
  const [isSliding, setIsSliding] = useState(false);
  
  // 3D Isometric rotation angle
  const [isometricAngle, setIsometricAngle] = useState(35); // degrees
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingFeature | null>(null);

  // Reset viewport when scenario changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [scenario.id]);

  // Center smoothly on selected building
  useEffect(() => {
    if (selectedBuilding && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const targetX = (selectedBuilding.x / 100) * rect.width;
      const targetY = (selectedBuilding.y / 100) * rect.height;
      setPan({
        x: rect.width / 2 - targetX * zoom,
        y: rect.height / 2 - targetY * zoom
      });
    }
  }, [selectedBuilding]);

  // Visible buildings based on filters
  const visibleBuildings = useMemo(() => {
    return scenario.buildings.filter((b) => {
      if (hiddenBuildingIds.includes(b.id)) return false;
      if (activeFilter === 'destroyed') return b.damage === 'destroyed';
      if (activeFilter === 'major') return b.damage === 'major-damage';
      if (activeFilter === 'voids' || activeTool === 'radar') return b.voidLikelihood === 'High';
      if (activeFilter === 'ingress') return b.damage === 'no-damage' || b.damage === 'minor-damage';
      return true;
    });
  }, [scenario.buildings, hiddenBuildingIds, activeFilter, activeTool]);

  // Core High-Performance Canvas Renderer (100% Offline, Zero External APIs)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Save root state for Pan & Zoom transforms
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. RENDER ORTHOMOSAIC SATELLITE TERRAIN (OFFLINE AUTONOMOUS ENGINE)
      // Base dark satellite earth palette
      const groundGrad = ctx.createLinearGradient(0, 0, width, height);
      groundGrad.addColorStop(0, '#13171f');
      groundGrad.addColorStop(0.5, '#171b24');
      groundGrad.addColorStop(1, '#0e1218');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, width, height);

      // Procedural orthorectified urban street grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Asphalt Primary Arterials & Avenues
      const drawRoad = (x1: number, y1: number, x2: number, y2: number, roadWidth: number, name: string) => {
        ctx.strokeStyle = '#222733';
        ctx.lineWidth = roadWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Asphalt road surface texture & center dashed marking
        ctx.strokeStyle = '#2d3444';
        ctx.lineWidth = roadWidth - 4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Road Name Watermark
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.font = '10px ui-monospace, monospace';
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillText(name, midX + 8, midY - 6);
      };

      // Main Road Network
      drawRoad(width * 0.1, height * 0.28, width * 0.9, height * 0.28, 22, 'Avenue Central North');
      drawRoad(width * 0.1, height * 0.55, width * 0.9, height * 0.55, 20, 'Boulevard Central');
      drawRoad(width * 0.1, height * 0.82, width * 0.9, height * 0.82, 18, 'South Perimeter Way');
      drawRoad(width * 0.26, height * 0.05, width * 0.26, height * 0.95, 18, 'West Axis Street');
      drawRoad(width * 0.50, height * 0.05, width * 0.50, height * 0.95, 20, 'Central Meridian');
      drawRoad(width * 0.74, height * 0.05, width * 0.74, height * 0.95, 22, 'East Industrial Corridor');

      // 2. CLEARED INGRESS ROUTE ALPHA (Polyline & Waypoints)
      if (activeTool === 'ingress' || activeFilter === 'ingress' || activeFilter === 'all') {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(width * 0.12, height * 0.08);
        ctx.lineTo(width * 0.26, height * 0.28);
        ctx.lineTo(width * 0.50, height * 0.45);
        ctx.lineTo(width * 0.65, height * 0.72);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ingress route glow
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Ingress Entry Flag
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(width * 0.12, height * 0.08, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.fillText('ENTRY ALPHA (CLEARED)', width * 0.12 + 10, height * 0.08 + 3);
      }

      // 3. SURVIVABILITY HEATMAP LAYER (T1 v3 Engine)
      if (showHeatmap) {
        scenario.buildings.forEach((b) => {
          const bx = (b.x / 100) * width;
          const by = (b.y / 100) * height;

          if (b.damage === 'destroyed' || b.damage === 'major-damage') {
            // Danger gradient (crimson / orange core)
            const rad = b.damage === 'destroyed' ? 70 : 50;
            const heatGrad = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
            heatGrad.addColorStop(0, b.damage === 'destroyed' ? 'rgba(244, 63, 94, 0.45)' : 'rgba(245, 158, 11, 0.35)');
            heatGrad.addColorStop(0.6, b.damage === 'destroyed' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.1)');
            heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = heatGrad;
            ctx.beginPath();
            ctx.arc(bx, by, rad, 0, Math.PI * 2);
            ctx.fill();
          } else if (b.damage === 'no-damage') {
            // Safety zone gradient (emerald green buffer)
            const safeGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 45);
            safeGrad.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            safeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = safeGrad;
            ctx.beginPath();
            ctx.arc(bx, by, 45, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 4. BUILDING FOOTPRINTS / 3D DAMAGE CITY LAYER
      visibleBuildings.forEach((b) => {
        const bx = (b.x / 100) * width;
        const by = (b.y / 100) * height;
        const bw = (b.width / 100) * width;
        const bh = (b.height / 100) * height;
        const isSelected = selectedBuilding?.id === b.id;
        const isHovered = hoveredBuilding?.id === b.id;

        const getColor = (dmg: DamageLevel) => {
          switch (dmg) {
            case 'destroyed':
              return { border: '#f43f5e', fill: 'rgba(244, 63, 94, 0.35)', top: '#e11d48' };
            case 'major-damage':
              return { border: '#f59e0b', fill: 'rgba(245, 158, 11, 0.35)', top: '#d97706' };
            case 'minor-damage':
              return { border: '#eab308', fill: 'rgba(234, 179, 8, 0.25)', top: '#ca8a04' };
            case 'no-damage':
            default:
              return { border: '#10b981', fill: 'rgba(16, 185, 129, 0.25)', top: '#059669' };
          }
        };

        const colors = getColor(b.damage);

        if (show3DCity) {
          // LAYER 5: 3D DAMAGE CITY EXTRUSION (Isometric Blocks)
          // Height based on storeys: collapsed pancake has compressed height (4px), intact is tall (floors * 12px)
          const baseHeight = b.collapseType === 'Pancake' || b.collapseType === 'Rubble Heap'
            ? 6
            : b.damage === 'major-damage'
            ? b.floors * 8
            : b.floors * 13;
          
          const angleRad = (isometricAngle * Math.PI) / 180;
          const dx = Math.sin(angleRad) * baseHeight;
          const dy = -Math.cos(angleRad) * baseHeight;

          // South / West Wall faces
          ctx.fillStyle = isSelected ? '#0070d8' : colors.fill;
          ctx.strokeStyle = isSelected ? '#38bdf8' : colors.border;
          ctx.lineWidth = isSelected ? 2.5 : 1;

          // Front-facing vertical extrusion
          ctx.beginPath();
          ctx.moveTo(bx, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw + dx, by + bh + dy);
          ctx.lineTo(bx + dx, by + bh + dy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Side-facing extrusion
          ctx.fillStyle = isSelected ? '#005bb5' : 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.moveTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw + dx, by + bh + dy);
          ctx.lineTo(bx + bw + dx, by + dy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Top Roof Face
          ctx.fillStyle = isSelected ? '#0084ff' : colors.top;
          ctx.beginPath();
          ctx.moveTo(bx + dx, by + dy);
          ctx.lineTo(bx + bw + dx, by + dy);
          ctx.lineTo(bx + bw + dx, by + bh + dy);
          ctx.lineTo(bx + dx, by + bh + dy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Collapse debris rubble texture for destroyed buildings in 3D
          if (b.damage === 'destroyed') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(bx + dx + bw * 0.4, by + dy + bh * 0.5, 3, 0, Math.PI * 2);
            ctx.arc(bx + dx + bw * 0.7, by + dy + bh * 0.3, 2.5, 0, Math.PI * 2);
            ctx.arc(bx + dx + bw * 0.2, by + dy + bh * 0.7, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Building ID tag above 3D block
          ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(241, 245, 249, 0.9)';
          ctx.font = 'bold 9px ui-monospace, monospace';
          ctx.fillText(`${b.id}`, bx + dx + 3, by + dy - 4);
        } else {
          // STANDARD 2D AERIAL FOOTPRINT
          // Debris scatter perimeter for collapsed buildings
          if (b.damage === 'destroyed') {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(bx - 6, by - 6, bw + 12, bh + 12);
            ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 12);
            ctx.setLineDash([]);
          }

          // Main Building Polygon Footprint
          ctx.fillStyle = isSelected ? 'rgba(0, 132, 255, 0.65)' : colors.fill;
          ctx.strokeStyle = isSelected ? '#0084ff' : colors.border;
          ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 1.5;
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeRect(bx, by, bw, bh);

          // Roof Structure line
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + bw, by + bh);
          ctx.stroke();

          // Building Tag Label
          ctx.fillStyle = isSelected ? '#ffffff' : colors.border;
          ctx.font = 'bold 10px ui-monospace, monospace';
          ctx.fillText(`${b.id}`, bx + 4, by + 12);
          ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
          ctx.font = '8px ui-monospace, monospace';
          ctx.fillText(`${b.ems98Grade || 'G?'} · ${b.floors}F`, bx + 4, by + 22);
        }

        // 5. AIR VOID RADAR RINGS (T1 v3 Specification)
        if (b.voidLikelihood === 'High' && (activeTool === 'radar' || activeFilter === 'voids' || isSelected)) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();
          ctx.setLineDash([]);

          // Center Radar Ping Dot
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by + bh / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. BEFORE / AFTER COMPARISON SLIDER OVERLAY (Section 4.2)
      if (showBeforeAfter) {
        const splitX = (sliderPos / 100) * width;

        // Render Pre-Disaster Intact Overlay on the Left Side
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, height);
        ctx.clip();

        // Pre-disaster green intact baseline tint
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(0, 0, splitX, height);

        // Pre-disaster intact labels
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(`PRE-DISASTER SATELLITE BASELINE: ${scenario.beforeDate || 'Pre-Event'}`, 24, 40);

        ctx.restore();

        // Vertical Split Divider Line
        ctx.strokeStyle = '#0084ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, height);
        ctx.stroke();

        // Split Line Handle Knob
        ctx.fillStyle = '#0084ff';
        ctx.beginPath();
        ctx.arc(splitX, height / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillText('◄►', splitX - 8, height / 2 + 4);

        // Right side post-disaster label
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(`POST-EVENT DAMAGE SURVEY: ${scenario.afterDate || scenario.date}`, splitX + 16, 40);
      }

      // Restore root transform
      ctx.restore();

      // 7. CENTER TARGET RETICLE (HUD)
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.moveTo(cx - 45, cy);
      ctx.lineTo(cx + 45, cy);
      ctx.moveTo(cx, cy - 45);
      ctx.lineTo(cx, cy + 45);
      ctx.stroke();
    };

    render();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        render();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    scenario,
    visibleBuildings,
    selectedBuilding,
    hoveredBuilding,
    pan,
    zoom,
    sliderPos,
    showBeforeAfter,
    showHeatmap,
    show3DCity,
    isometricAngle,
    activeTool,
    activeFilter
  ]);

  // Mouse pan and click detection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (showBeforeAfter && Math.abs(e.clientX - (sliderPos / 100) * window.innerWidth) < 25) {
      setIsSliding(true);
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSliding) {
      const newPos = Math.max(5, Math.min(95, (e.clientX / window.innerWidth) * 100));
      setSliderPos(newPos);
      return;
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Hit test buildings on hover
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      const width = rect.width;
      const height = rect.height;

      const hit = visibleBuildings.find((b) => {
        const bx = (b.x / 100) * width;
        const by = (b.y / 100) * height;
        const bw = (b.width / 100) * width;
        const bh = (b.height / 100) * height;
        return mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;
      });

      setHoveredBuilding(hit || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSliding(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      const width = rect.width;
      const height = rect.height;

      const hit = visibleBuildings.find((b) => {
        const bx = (b.x / 100) * width;
        const by = (b.y / 100) * height;
        const bw = (b.width / 100) * width;
        const bh = (b.height / 100) * height;
        return mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;
      });

      if (hit) {
        sound.playSonarPing();
        onSelectBuilding(hit);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.max(0.6, Math.min(4.5, prev * factor)));
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#090a0f]">
      {/* 100% Offline Canvas Engine */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className={`w-full h-full cursor-grab active:cursor-grabbing transition-all ${
          activeTool === 'thermal'
            ? 'filter contrast-150 saturate-200 hue-rotate-190 brightness-90'
            : ''
        }`}
      />

      {/* Offline Status Badge (Top Center-Left) */}
      <div className="absolute top-18 left-3 z-20 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-xs font-mono shadow-2xl">
        {isOfflineOnly ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">OFFLINE SAFE (0 API CALLS)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>ONLINE TILE MODE</span>
          </div>
        )}
        <button
          onClick={onToggleOffline}
          className="ml-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition-colors border border-white/10"
        >
          {isOfflineOnly ? 'Switch to Online Stream' : 'Switch to Pure Offline'}
        </button>
      </div>



      {/* Hover Tooltip when cursor over building */}
      {hoveredBuilding && (
        <div 
          className="absolute z-30 pointer-events-none p-2.5 rounded-xl bg-[#121214]/95 backdrop-blur-xl border border-white/20 text-xs font-mono shadow-2xl text-slate-200 space-y-1"
          style={{
            left: `${Math.min(window.innerWidth - 220, (hoveredBuilding.x / 100) * window.innerWidth + pan.x + 20)}px`,
            top: `${Math.min(window.innerHeight - 120, (hoveredBuilding.y / 100) * window.innerHeight + pan.y + 20)}px`
          }}
        >
          <div className="font-bold text-white flex items-center justify-between gap-3">
            <span>{hoveredBuilding.id}: {hoveredBuilding.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
              hoveredBuilding.damage === 'destroyed' ? 'bg-rose-500/20 text-rose-300' :
              hoveredBuilding.damage === 'major-damage' ? 'bg-amber-500/20 text-amber-300' :
              'bg-emerald-500/20 text-emerald-300'
            }`}>
              {hoveredBuilding.ems98Grade || hoveredBuilding.damage}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {hoveredBuilding.collapseType} · {hoveredBuilding.floors} Storeys · Area: {hoveredBuilding.areaM2 || 320} m²
          </div>
          <div className="text-[10px] text-slate-400">
            Dist to Collapse: <strong className="text-amber-300">{hoveredBuilding.distanceToNearestDestroyedM ?? 0}m</strong> · Void: {hoveredBuilding.voidLikelihood}
          </div>
        </div>
      )}

      {/* Floating Canvas Navigation Controls (Bottom-Left) */}
      <div className="absolute bottom-18 left-3 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button
          onClick={() => setZoom((prev) => Math.min(4.5, prev * 1.25))}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(0.6, prev * 0.8))}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sound.playRadioChirp();
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
          title="Reset Viewport"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial HUD Badge (Bottom-Left above controls) */}
      <div className="absolute bottom-32 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-slate-300 shadow-2xl">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>GSD 0.3m/px · {scenario.location} ({scenario.centerLat}°N, {scenario.centerLng}°E)</span>
      </div>
    </div>
  );
};
