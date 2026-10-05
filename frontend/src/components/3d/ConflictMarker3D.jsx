import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { CheckCircle2, Focus, ShieldAlert } from 'lucide-react';

export function ConflictMarker3D({
  conflictResult,
  verticalExaggeration = 1.0,
  onSelectConflict,
  isMapActive = true
}) {
  const proposed_geometry = conflictResult?.proposed_geometry;
  const conflicts = conflictResult?.conflicts;
  const has_conflict = conflictResult?.has_conflict;
  const min_distance_meters = conflictResult?.min_distance_meters;

  const { v1, v2, routeCenter, curve } = useMemo(() => {
    if (!proposed_geometry || !proposed_geometry.start || !proposed_geometry.end) {
      return { v1: null, v2: null, routeCenter: null, curve: null };
    }
    const p1 = proposed_geometry.start;
    const p2 = proposed_geometry.end;
    const vec1 = new THREE.Vector3(p1[0], p1[1] * verticalExaggeration, p1[2]);
    const vec2 = new THREE.Vector3(p2[0], p2[1] * verticalExaggeration, p2[2]);
    const center = new THREE.Vector3().addVectors(vec1, vec2).multiplyScalar(0.5);
    const crv = new THREE.LineCurve3(vec1, vec2);
    return { v1: vec1, v2: vec2, routeCenter: center, curve: crv };
  }, [proposed_geometry, verticalExaggeration]);

  if (!conflictResult || !isMapActive || !curve || !v1 || !v2 || !routeCenter) return null;

  return (
    <group>
      {/* 1. Proposed Route Volumetric 3D Tube */}
      <mesh>
        <tubeGeometry args={[curve, 32, 0.4, 12, false]} />
        <meshStandardMaterial
          color={has_conflict ? '#EF4444' : '#10B981'}
          emissive={has_conflict ? '#DC2626' : '#059669'}
          emissiveIntensity={has_conflict ? 0.7 : 0.4}
          transparent={true}
          opacity={0.9}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Screen-Space Overlay Line for Proposed Route */}
      <Line
        points={[v1, v2]}
        color={has_conflict ? '#EF4444' : '#10B981'}
        lineWidth={3.5}
        dashed={true}
        dashScale={1.5}
        dashSize={1.2}
        gapSize={0.6}
        depthTest={false}
        renderOrder={97}
      />

      {/* Route Terminal Endpoints */}
      <mesh position={v1}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={has_conflict ? '#EF4444' : '#10B981'} />
      </mesh>
      <mesh position={v2}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={has_conflict ? '#EF4444' : '#10B981'} />
      </mesh>

      {/* 2. Detected Conflict Markers & Tags */}
      {has_conflict && Array.isArray(conflicts) && conflicts.map((c, idx) => {
        const cx = c.conflict_x !== undefined ? c.conflict_x : routeCenter.x;
        const cy = (c.conflict_y !== undefined ? c.conflict_y : proposed_geometry.depth) * verticalExaggeration;
        const cz = c.conflict_z !== undefined ? c.conflict_z : routeCenter.z;

        const tagY = Math.max(3.5, cy + 3.8 + (idx * 3.2));
        const staggerX = cx + (idx % 2 === 0 ? 1.5 : -1.5) * (idx > 0 ? idx : 0.5);
        const sitePos = [cx, cy, cz];

        const isCritical = c.minimum_distance_m === 0 || c.status?.includes('CRITICAL') || c.status?.includes('ENCROACHMENT');
        const clearanceDist = c.minimum_distance_m !== undefined ? c.minimum_distance_m : (min_distance_meters || 0.35);
        const requiredClearance = c.required_clearance_m || 1.2;

        let recommendation = '';
        if (c.existing_type === 'building') {
          recommendation = 'Reroute alignment outside property parcel boundary.';
        } else {
          const safeDepth = (c.conflict_y !== undefined ? c.conflict_y : -3.5) - 2.5;
          recommendation = `Deepen proposed route to ≤ ${safeDepth.toFixed(1)}m (or offset horizontally ≥ 2.0m).`;
        }

        return (
          <group key={idx} position={sitePos}>
            {/* Warning Hazard Wireframe Sphere */}
            <mesh>
              <sphereGeometry args={[1.4, 16, 16]} />
              <meshBasicMaterial color="#EF4444" transparent opacity={0.3} wireframe />
            </mesh>

            {/* Core Marker Sphere */}
            <mesh>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshStandardMaterial color="#DC2626" emissive="#991B1B" emissiveIntensity={0.6} />
            </mesh>

            {/* Vertical Pulsing Indicator Beacon Line */}
            <mesh position={[0, 4.0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 8, 8]} />
              <meshBasicMaterial color="#EF4444" transparent opacity={0.65} />
            </mesh>

            {/* Dashed Connector Line */}
            <Line
              points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(staggerX - cx, tagY - cy, 0)]}
              color="#EF4444"
              lineWidth={1.5}
              dashed={true}
              dashScale={2}
              dashSize={0.5}
              gapSize={0.5}
              depthTest={false}
              renderOrder={98}
            />

            {/* Contextual Conflict Information Tag */}
            <Html
              position={[staggerX - cx, tagY - cy, 0]}
              center
              zIndexRange={[1, 5]}
              style={{ pointerEvents: 'auto', userSelect: 'none' }}
            >
              <div className="p-3 rounded-lg bg-[#111417]/95 backdrop-blur-md border border-rose-500/40 text-slate-200 w-[270px] shadow-2xl select-none space-y-2 animate-in fade-in duration-150">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{isCritical ? 'CRITICAL CLASH' : 'CLEARANCE BREACH'}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300">
                    {c.status?.replace('_', ' ') || 'ACTION REQ'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-slate-100 truncate">
                    {c.existing_name || c.existing_ulpin || 'Conflicting Utility Asset'}
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    ULPIN: {c.existing_ulpin || '3D-CADASTRE-REF'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono bg-[#181C20] px-2 py-1 rounded border border-white/[0.06]">
                    <span className="text-slate-400">Measured:</span>
                    <span className="font-bold text-rose-400">{clearanceDist}m</span>
                    <span className="text-slate-500 text-[10px]">· Req: {requiredClearance}m</span>
                  </div>

                  <div className="text-[10px] text-slate-300 bg-rose-500/10 p-1.5 rounded border border-rose-500/20 leading-snug">
                    <strong className="text-rose-400">Action: </strong>
                    {recommendation}
                  </div>
                </div>

                {onSelectConflict && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConflict(c);
                    }}
                    className="w-full h-6 rounded bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Open conflict panel"
                  >
                    <Focus className="w-3 h-3" />
                    <span>Inspect in Conflict Panel</span>
                  </button>
                )}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 3. Clearance Banner when NO CONFLICT */}
      {!has_conflict && (
        <Html
          position={[routeCenter.x, routeCenter.y + 1.2, routeCenter.z]}
          center
          zIndexRange={[1, 5]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="px-3 py-1.5 rounded-md border border-emerald-500/30 bg-[#111417]/95 backdrop-blur-md text-emerald-400 text-xs font-medium flex items-center gap-2 shadow-xl pointer-events-none select-none whitespace-nowrap animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Clear Route ({proposed_geometry.depth}m Depth) · Clearance Verified</span>
          </div>
        </Html>
      )}
    </group>
  );
}
