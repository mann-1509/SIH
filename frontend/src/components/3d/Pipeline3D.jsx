import React, { useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { localToLatLon } from '../../services/api';

export function Pipeline3D({
  pipeline,
  onSelectAsset,
  selectedAsset,
  verticalExaggeration = 1.0,
  undergroundView = true,
  showPipeOverlay = true,
  conflictInfo = null,
  onSelectConflict = null,
  isNewGlow = false,
  isMapActive = true
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  const isSelected = selectedAsset && selectedAsset.ulpin === pipeline.ulpin;
  const isConflicted = Boolean(conflictInfo);
  const showTag = isMapActive && (showPipeOverlay || undergroundView || isConflicted) && (hovered || focused);

  // Subsurface coordinates at true depth
  const p1 = useMemo(
    () => [pipeline.start_x || 0, pipeline.start_y !== undefined ? pipeline.start_y : -2, pipeline.start_z || 0],
    [pipeline.start_x, pipeline.start_y, pipeline.start_z]
  );
  const p2 = useMemo(
    () => [pipeline.end_x || 10, pipeline.end_y !== undefined ? pipeline.end_y : -2, pipeline.end_z || 10],
    [pipeline.end_x, pipeline.end_y, pipeline.end_z]
  );

  const v1 = useMemo(() => new THREE.Vector3(p1[0], p1[1] * verticalExaggeration, p1[2]), [p1, verticalExaggeration]);
  const v2 = useMemo(() => new THREE.Vector3(p2[0], p2[1] * verticalExaggeration, p2[2]), [p2, verticalExaggeration]);

  const subsurfaceCurve = useMemo(() => new THREE.LineCurve3(v1, v2), [v1, v2]);
  const depthCenter = useMemo(() => new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5), [v1, v2]);

  // Color mapping based on utility infrastructure type
  const typeColors = {
    water_pipe: '#0284C7',     // Cyan / Blue
    electric_cable: '#D97706', // Amber / Copper
    fiber_cable: '#7E22CE',    // Violet
    other: '#10B981'           // Emerald
  };

  const baseColor = typeColors[pipeline.asset_type] || '#0284C7';
  const radius = pipeline.asset_type === 'water_pipe' ? 0.4 : pipeline.asset_type === 'electric_cable' ? 0.3 : 0.22;

  const activeColor = isConflicted
    ? '#EF4444'
    : isNewGlow
    ? '#38BDF8'
    : isSelected
    ? '#0284C7'
    : hovered
    ? '#38BDF8'
    : baseColor;

  const activeEmissive = isConflicted
    ? '#DC2626'
    : isNewGlow
    ? '#0284C7'
    : isSelected
    ? '#0284C7'
    : hovered
    ? '#0369A1'
    : '#000000';

  const activeEmissiveIntensity = isConflicted
    ? 0.75
    : isNewGlow
    ? 0.6
    : isSelected
    ? 0.45
    : hovered
    ? 0.25
    : 0.0;

  // Selection & 3D Spatial Click Handling
  const handleClick = (e) => {
    e.stopPropagation();
    const point = e.point;

    const realDepth = pipeline.depth !== undefined ? pipeline.depth : (pipeline.start_y || -2.0);
    const realY = point.y <= 0.25 ? realDepth : (point.y / verticalExaggeration);
    const { lat, lon } = localToLatLon(point.x, point.z);

    const clickData = {
      x: Number(point.x.toFixed(2)),
      y: Number(realY.toFixed(2)),
      z: Number(point.z.toFixed(2)),
      worldX: point.x,
      worldY: realY * verticalExaggeration,
      worldZ: point.z,
      distance: 18,
      lat,
      lon,
      depth: Number(realY.toFixed(2))
    };

    if (isConflicted && onSelectConflict) {
      onSelectConflict({
        ...conflictInfo,
        conflict_x: point.x,
        conflict_y: realY,
        conflict_z: point.z
      });
    }
    onSelectAsset(pipeline, clickData);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const isVisible = undergroundView || showPipeOverlay || isSelected || isConflicted;
  if (!isVisible) return null;

  return (
    <group>
      {/* Dashed screen-space overlay line at subterranean depth */}
      <Line
        points={[v1, v2]}
        color={activeColor}
        lineWidth={hovered || isSelected || isConflicted ? 4.0 : 2.5}
        dashed={true}
        dashScale={1.5}
        dashSize={1.2}
        gapSize={0.6}
        depthTest={!showPipeOverlay && !isConflicted}
        renderOrder={isConflicted ? 96 : 95}
      />

      {/* Subterranean 3D Volumetric Pipe Body */}
      <mesh>
        <tubeGeometry args={[subsurfaceCurve, 32, radius, 12, false]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeEmissive}
          emissiveIntensity={activeEmissiveIntensity}
          roughness={0.4}
          metalness={0.5}
          transparent={!undergroundView && (showPipeOverlay || isConflicted)}
          opacity={!undergroundView && (showPipeOverlay || isConflicted) ? (isConflicted ? 0.75 : 0.4) : 1.0}
          depthWrite={undergroundView}
        />
      </mesh>

      {/* Terminal Cap Spheres */}
      <mesh position={v1}>
        <sphereGeometry args={[radius * 1.15, 16, 16]} />
        <meshStandardMaterial
          color={activeColor}
          transparent={!undergroundView && (showPipeOverlay || isConflicted)}
          opacity={!undergroundView && (showPipeOverlay || isConflicted) ? (isConflicted ? 0.75 : 0.4) : 1.0}
        />
      </mesh>
      <mesh position={v2}>
        <sphereGeometry args={[radius * 1.15, 16, 16]} />
        <meshStandardMaterial
          color={activeColor}
          transparent={!undergroundView && (showPipeOverlay || isConflicted)}
          opacity={!undergroundView && (showPipeOverlay || isConflicted) ? (isConflicted ? 0.75 : 0.4) : 1.0}
        />
      </mesh>

      {/* Interactive Hitbox */}
      <mesh
        tabIndex={0}
        renderOrder={96}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={handleClick}
      >
        <tubeGeometry args={[subsurfaceCurve, 24, 1.2, 8, false]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Hover / Focus Tag */}
      {showTag && (
        <Html
          position={[depthCenter.x, depthCenter.y + 0.8, depthCenter.z]}
          center
          zIndexRange={[1, 5]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className={`px-3 py-2 rounded-lg bg-[#111417]/95 backdrop-blur-md text-xs whitespace-nowrap shadow-xl border ${
            isConflicted ? 'border-rose-500/40 ring-1 ring-rose-500/30' : 'border-white/[0.12]'
          } text-slate-200 pointer-events-none select-none space-y-1 transition-all duration-150 animate-in fade-in`}>
            {isConflicted && (
              <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                <span>⚠️ DETECTED CONFLICT:</span>
                <span>{conflictInfo.status?.replace('_', ' ') || 'SAFETY BREACH'} ({conflictInfo.minimum_distance_m}m)</span>
              </div>
            )}
            <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: activeColor }}></span>
              <span className="truncate">{pipeline.name}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="uppercase">{pipeline.asset_type?.replace('_', ' ')}</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">Depth: {pipeline.depth || pipeline.start_y || -2}m</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
