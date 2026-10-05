import React, { useState } from 'react';
import { Html } from '@react-three/drei';

export function Building3D({
  building,
  floors,
  onSelectAsset,
  selectedAsset,
  verticalExaggeration = 1.0,
  conflictInfo = null,
  onSelectConflict = null,
  isMapActive = true
}) {
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [focusedFloor, setFocusedFloor] = useState(null);
  const [hoveredBuilding, setHoveredBuilding] = useState(false);
  const [focusedBuilding, setFocusedBuilding] = useState(false);

  const BASE_LAT = 23.0225;
  const BASE_LON = 72.5714;
  const LAT_TO_METERS = 110574.0;
  const LON_TO_METERS = 102500.0;

  const bx = (building.longitude - BASE_LON) * LON_TO_METERS;
  const bz = -(building.latitude - BASE_LAT) * LAT_TO_METERS;

  const width = building.width || 12;
  const length = building.length || 12;
  const height = building.height || 16;
  
  // Architectural building tones
  const buildingColors = {
    '3D-ULPIN-GJ-AHM-BLD-001': '#334155', // Slate Slate
    '3D-ULPIN-GJ-AHM-BLD-002': '#1E293B', // Deep Slate
    '3D-ULPIN-GJ-AHM-BLD-003': '#27272A', // Dark Mineral
  };

  const isConflicted = Boolean(conflictInfo);
  const baseColor = buildingColors[building.ulpin] || '#334155';
  const isBuildingSelected = selectedAsset && selectedAsset.ulpin === building.ulpin;
  const showBuildingTag = isMapActive && (hoveredBuilding || isBuildingSelected || focusedBuilding);

  return (
    <group position={[bx, 0, bz]}>
      {/* Concrete Base Foundation Slab */}
      <mesh
        position={[0, 0.15, 0]}
        tabIndex={0}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBuilding(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredBuilding(false);
        }}
        onFocus={() => setFocusedBuilding(true)}
        onBlur={() => setFocusedBuilding(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (isConflicted && onSelectConflict) {
            onSelectConflict({
              ...conflictInfo,
              conflict_x: bx,
              conflict_y: 0,
              conflict_z: bz
            });
          }
          onSelectAsset(building, {
            x: Number(bx.toFixed(2)),
            y: Number(((height || 16) / 2).toFixed(2)),
            z: Number(bz.toFixed(2)),
            worldX: bx,
            worldY: ((height || 16) / 2) * verticalExaggeration,
            worldZ: bz,
            distance: 38,
            lat: building.latitude,
            lon: building.longitude
          });
        }}
      >
        <boxGeometry args={[width + 1.0, 0.3, length + 1.0]} />
        <meshStandardMaterial
          color={isConflicted ? '#EF4444' : isBuildingSelected ? '#0284C7' : hoveredBuilding ? '#334155' : '#0F172A'}
          emissive={isConflicted ? '#DC2626' : '#000000'}
          emissiveIntensity={isConflicted ? 0.6 : 0.0}
          roughness={0.7}
        />
      </mesh>

      {/* Conflicted Structure Warning Wireframe Boundary */}
      {isConflicted && (
        <mesh position={[0, ((height || 16) * verticalExaggeration) / 2, 0]}>
          <boxGeometry args={[width + 1.5, (height || 16) * verticalExaggeration + 0.4, length + 1.5]} />
          <meshBasicMaterial color="#EF4444" wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {/* Stacked Floor Property Boxes */}
      {floors && floors.length > 0 ? (
        floors.map((fl) => {
          const isSelected = selectedAsset && selectedAsset.ulpin === fl.ulpin;
          const isHovered = hoveredFloor === fl.ulpin;
          const isFocused = focusedFloor === fl.ulpin;
          const showFloorTag = isMapActive && (isHovered || isSelected || isFocused);

          const flHeight = fl.height || 3.8;
          const rawElevation = fl.elevation || 0;
          
          const yPos = (rawElevation + flHeight / 2) * verticalExaggeration;
          const visualHeight = flHeight * verticalExaggeration;

          let flColor = isSelected ? '#0284C7' : isHovered ? '#38BDF8' : baseColor;

          const handleFloorClick = (e) => {
            e.stopPropagation();
            const clickInfo = {
              x: Number(bx.toFixed(2)),
              y: Number((rawElevation + flHeight / 2).toFixed(2)),
              z: Number(bz.toFixed(2)),
              worldX: bx,
              worldY: yPos,
              worldZ: bz,
              distance: 18,
              lat: fl.latitude || building.latitude,
              lon: fl.longitude || building.longitude,
              elevation: rawElevation,
              isFloor: true
            };
            onSelectAsset(fl, clickInfo);
          };

          return (
            <group key={fl.ulpin} position={[0, yPos, 0]}>
              <mesh
                tabIndex={0}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredFloor(fl.ulpin);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredFloor(null);
                }}
                onFocus={() => setFocusedFloor(fl.ulpin)}
                onBlur={() => setFocusedFloor(null)}
                onClick={handleFloorClick}
              >
                <boxGeometry args={[width, visualHeight - 0.1, length]} />
                <meshStandardMaterial
                  color={flColor}
                  transparent={true}
                  opacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
                  roughness={0.4}
                  metalness={0.2}
                />
              </mesh>

              {/* Window Accents */}
              <mesh position={[0, 0, length / 2 + 0.04]}>
                <planeGeometry args={[width * 0.85, visualHeight * 0.35]} />
                <meshBasicMaterial color={isSelected ? '#38BDF8' : '#0284C7'} transparent opacity={0.5} />
              </mesh>

              {/* Floor Structure Tag */}
              {showFloorTag && (
                <Html
                  position={[0, visualHeight / 2 + 0.4, 0]}
                  center
                  zIndexRange={[1, 5]}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  <div className="px-2.5 py-1 rounded-md bg-[#111417]/95 backdrop-blur-md shadow-xl border border-white/[0.12] text-slate-200 text-xs whitespace-nowrap pointer-events-none select-none flex items-center gap-2 font-medium transition-all duration-150 animate-in fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
                    <span>{building.name} · Fl {fl.floor_number}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({fl.ulpin})</span>
                  </div>
                </Html>
              )}
            </group>
          );
        })
      ) : (
        <mesh
          position={[0, (height / 2) * verticalExaggeration, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredBuilding(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredBuilding(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            const bldY = ((height / 2) * verticalExaggeration);
            onSelectAsset(building, {
              x: Number(bx.toFixed(2)),
              y: Number((height / 2).toFixed(2)),
              z: Number(bz.toFixed(2)),
              worldX: bx,
              worldY: bldY,
              worldZ: bz,
              distance: 38,
              lat: building.latitude,
              lon: building.longitude
            });
          }}
        >
          <boxGeometry args={[width, height * verticalExaggeration, length]} />
          <meshStandardMaterial color={isBuildingSelected ? '#0284C7' : baseColor} transparent opacity={0.75} />
        </mesh>
      )}

      {/* Building Structure Tag */}
      {showBuildingTag && (
        <Html
          position={[0, (height + 1.2) * verticalExaggeration, 0]}
          center
          zIndexRange={[1, 5]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className={`px-2.5 py-1 rounded-md bg-[#111417]/95 backdrop-blur-md text-xs font-medium text-slate-200 border ${
            isConflicted ? 'border-rose-500/40 ring-1 ring-rose-500/30' : 'border-white/[0.12]'
          } shadow-xl whitespace-nowrap pointer-events-none select-none transition-all duration-150 animate-in fade-in flex items-center gap-2`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConflicted ? 'bg-rose-500' : 'bg-sky-400'}`}></span>
            {isConflicted && (
              <span className="text-[10px] font-bold text-rose-400 uppercase">⚠️ Conflict ·</span>
            )}
            <span className="truncate">{building.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({building.ulpin})</span>
          </div>
        </Html>
      )}
    </group>
  );
}
