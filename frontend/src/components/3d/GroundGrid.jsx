import React from 'react';

export function GroundGrid({
  undergroundView = false,
  verticalExaggeration = 1.0,
  showCrossSection = false,
  _isMapActive = true,
  _onSelectAsset
}) {
  return (
    <group>
      {/* Primary Ground Surface (Y = 0) */}
      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial
          color={undergroundView ? '#111417' : '#0B0D0E'}
          transparent={true}
          opacity={undergroundView ? 0.35 : 0.95}
          roughness={0.9}
        />
      </mesh>

      {/* Surface Grid Lines */}
      <gridHelper args={[140, 70, '#334155', '#1E293B']} position={[0, 0.01, 0]} />

      {/* Road Plot Overlay */}
      <mesh position={[0, 0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 10]} />
        <meshBasicMaterial color="#1E293B" transparent opacity={0.6} />
      </mesh>

      {/* Subsurface Level Planes */}
      {undergroundView && (
        <group>
          {/* Subsurface Level 1 (-3.5m) */}
          <gridHelper
            args={[140, 35, '#0284C7', '#1E293B']}
            position={[0, -3.5 * verticalExaggeration, 0]}
          />

          {/* Subsurface Level 2 (-4.5m) */}
          <gridHelper
            args={[140, 35, '#D97706', '#1E293B']}
            position={[0, -4.5 * verticalExaggeration, 0]}
          />

          {/* Subsurface Level 3 (-6.0m) */}
          <gridHelper
            args={[140, 35, '#7E22CE', '#1E293B']}
            position={[0, -6.0 * verticalExaggeration, 0]}
          />
        </group>
      )}

      {/* Side Cross-Section Inspection Plane */}
      {showCrossSection && (
        <mesh position={[0, -5 * verticalExaggeration, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[140, 20 * verticalExaggeration]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.08} side={2} />
        </mesh>
      )}
    </group>
  );
}
