import React, { useEffect, useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GroundGrid } from './GroundGrid';
import { Building3D } from './Building3D';
import { Pipeline3D } from './Pipeline3D';
import { ConflictMarker3D } from './ConflictMarker3D';

function CameraController({ focusPoint, focusTrigger }) {
  const { camera, controls } = useThree();
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!focusTrigger || !focusPoint || !controls) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const targetVec = new THREE.Vector3(focusPoint.x, focusPoint.y, focusPoint.z);
    const distance = focusPoint.distance || 20;

    let currentDir = camera.position.clone().sub(controls.target);
    if (currentDir.lengthSq() < 0.001) {
      currentDir = new THREE.Vector3(1, 0.8, 1);
    }
    currentDir.normalize();

    currentDir.y = Math.max(0.35, Math.min(0.85, currentDir.y));
    currentDir.normalize();

    const startCam = camera.position.clone();
    const startTarget = controls.target.clone();
    const endCam = targetVec.clone().add(currentDir.multiplyScalar(distance));

    const duration = 750; // ms
    let startTime = null;

    function animateCam(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(startCam, endCam, ease);
      controls.target.lerpVectors(startTarget, targetVec, ease);
      controls.update();

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animateCam);
      } else {
        camera.position.copy(endCam);
        controls.target.copy(targetVec);
        controls.update();
      }
    }

    animFrameRef.current = requestAnimationFrame(animateCam);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [focusTrigger]);

  return null;
}

export function SceneContainer({
  assets = [],
  selectedAsset,
  onSelectAsset,
  undergroundView = true,
  showPipeOverlay = true,
  verticalExaggeration = 1.0,
  showCrossSection = false,
  conflictResult,
  onSelectConflict,
  focusPoint,
  focusTrigger,
  newlyCreatedUlpin,
  isMapActive = true,
  _activeTab = 'map'
}) {
  const buildings = assets.filter(a => a.asset_type === 'building');
  const floors = assets.filter(a => a.asset_type === 'floor');
  const pipelines = assets.filter(a => a.category === 'infrastructure');

  // Build lookup of conflicted existing entities
  const conflictMap = useMemo(() => {
    if (!conflictResult || !conflictResult.has_conflict) return {};
    const map = {};
    if (Array.isArray(conflictResult.conflicts)) {
      for (const c of conflictResult.conflicts) {
        if (c.existing_ulpin) {
          map[c.existing_ulpin] = c;
        }
      }
    }
    if (conflictResult.conflicting_asset?.ulpin && !map[conflictResult.conflicting_asset.ulpin]) {
      map[conflictResult.conflicting_asset.ulpin] = {
        existing_ulpin: conflictResult.conflicting_asset.ulpin,
        existing_name: conflictResult.conflicting_asset.name,
        minimum_distance_m: conflictResult.min_distance_meters || 0.35,
        status: 'SAFETY_BREACH'
      };
    }
    return map;
  }, [conflictResult]);

  return (
    <div className={`w-full h-full relative bg-[#0B0D0E] ${isMapActive ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={(e) => {
          if (e.type === 'click' && onSelectAsset) {
            onSelectAsset(null);
          }
        }}
      >
        <color attach="background" args={['#0B0D0E']} />
        
        {/* Balanced Engineering CAD Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[40, 60, 30]} intensity={1.1} castShadow />
        <pointLight position={[-30, 20, -30]} intensity={0.3} color="#38BDF8" />
        <pointLight position={[30, -10, 30]} intensity={0.2} color="#A855F7" />

        <PerspectiveCamera makeDefault position={[45, 35, 50]} fov={50} far={1000} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minDistance={3}
          maxDistance={250}
          enabled={isMapActive}
        />

        <CameraController focusPoint={focusPoint} focusTrigger={focusTrigger} />

        {/* 3D Scene */}
        <group>
          <GroundGrid
            undergroundView={undergroundView}
            verticalExaggeration={verticalExaggeration}
            showCrossSection={showCrossSection}
            isMapActive={isMapActive}
            onSelectAsset={onSelectAsset}
          />

          {/* Buildings & Vertical Floor Units */}
          {buildings.map(bld => {
            const bldFloors = floors.filter(f => f.parent_building_id === bld.id);
            return (
              <Building3D
                key={bld.ulpin}
                building={bld}
                floors={bldFloors}
                onSelectAsset={onSelectAsset}
                selectedAsset={selectedAsset}
                verticalExaggeration={verticalExaggeration}
                conflictInfo={conflictMap[bld.ulpin]}
                onSelectConflict={onSelectConflict}
                isMapActive={isMapActive}
              />
            );
          })}

          {/* Subsurface Utilities */}
          {pipelines.map(pipe => (
            <Pipeline3D
              key={pipe.ulpin}
              pipeline={pipe}
              onSelectAsset={onSelectAsset}
              selectedAsset={selectedAsset}
              verticalExaggeration={verticalExaggeration}
              undergroundView={undergroundView}
              showPipeOverlay={showPipeOverlay}
              conflictInfo={conflictMap[pipe.ulpin]}
              onSelectConflict={onSelectConflict}
              isNewGlow={newlyCreatedUlpin === pipe.ulpin}
              isMapActive={isMapActive}
            />
          ))}

          {/* Conflict Indicators */}
          <ConflictMarker3D
            conflictResult={conflictResult}
            verticalExaggeration={verticalExaggeration}
            onSelectConflict={onSelectConflict}
            showMarkers={isMapActive}
            isMapActive={isMapActive}
          />
        </group>
      </Canvas>
    </div>
  );
}
