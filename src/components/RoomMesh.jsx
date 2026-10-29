import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Grid } from '@react-three/drei';
import { FLOOR_MATERIALS, WALL_COLORS } from '../utils/lightingPhysics';

export default function RoomMesh({ room, showGrid, onSelectEmpty }) {
  const { width, depth, height, shape, floorMaterialId, wallColorId, showCeiling } = room;

  const floorMat = useMemo(
    () => FLOOR_MATERIALS.find((f) => f.id === floorMaterialId) || FLOOR_MATERIALS[0],
    [floorMaterialId]
  );

  const wallColor = useMemo(
    () => (WALL_COLORS.find((w) => w.id === wallColorId) || WALL_COLORS[0]).color,
    [wallColorId]
  );

  const wallThickness = 0.14;
  const hw = width / 2;
  const hd = depth / 2;

  // Custom shape geometry for L-shape or Octagonal floors
  const customFloorShape = useMemo(() => {
    const s = new THREE.Shape();
    if (shape === 'l-shape') {
      // L-Shape: cuts out top-right quadrant (x > 0, z > 0 in 2D shape coords)
      s.moveTo(-hw, -hd);
      s.lineTo(hw, -hd);
      s.lineTo(hw, 0);
      s.lineTo(0, 0);
      s.lineTo(0, hd);
      s.lineTo(-hw, hd);
      s.closePath();
    } else if (shape === 'octagonal') {
      const cutX = width * 0.25;
      const cutZ = depth * 0.25;
      s.moveTo(-hw + cutX, -hd);
      s.lineTo(hw - cutX, -hd);
      s.lineTo(hw, -hd + cutZ);
      s.lineTo(hw, hd - cutZ);
      s.lineTo(hw - cutX, hd);
      s.lineTo(-hw + cutX, hd);
      s.lineTo(-hw, hd - cutZ);
      s.lineTo(-hw, -hd + cutZ);
      s.closePath();
    } else {
      s.moveTo(-hw, -hd);
      s.lineTo(hw, -hd);
      s.lineTo(hw, hd);
      s.lineTo(-hw, hd);
      s.closePath();
    }
    return s;
  }, [width, depth, shape, hw, hd]);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.12,
      bevelEnabled: false,
    }),
    []
  );

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelectEmpty && onSelectEmpty();
        }}
      >
        <extrudeGeometry args={[customFloorShape, extrudeSettings]} />
        <meshStandardMaterial
          color={floorMat.color}
          roughness={floorMat.roughness}
          metalness={0.05}
        />
      </mesh>

      {/* Optional Architectural Measurement Grid */}
      {showGrid && (
        <Grid
          position={[0, 0.005, 0]}
          args={[width, depth]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#64748b"
          sectionSize={1}
          sectionThickness={1.1}
          sectionColor="#94a3b8"
          fadeDistance={25}
          fadeStrength={1}
        />
      )}

      {/* Walls based on shape */}
      {shape === 'rectangular' && (
        <>
          {/* Back Wall (North, z = -hd) */}
          <mesh
            position={[0, height / 2, -hd - wallThickness / 2]}
            receiveShadow
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectEmpty && onSelectEmpty();
            }}
          >
            <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Left Wall (West, x = -hw) */}
          <mesh
            position={[-hw - wallThickness / 2, height / 2, 0]}
            receiveShadow
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectEmpty && onSelectEmpty();
            }}
          >
            <boxGeometry args={[wallThickness, height, depth]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Right Low Cutaway Wall (East, x = +hw) */}
          <mesh
            position={[hw + wallThickness / 2, 0.25, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[wallThickness, 0.5, depth]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* White Baseboards */}
          <mesh position={[0, 0.06, -hd + 0.01]} receiveShadow>
            <boxGeometry args={[width, 0.12, 0.025]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh position={[-hw + 0.01, 0.06, 0]} receiveShadow>
            <boxGeometry args={[0.025, 0.12, depth]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        </>
      )}

      {shape === 'l-shape' && (
        <>
          {/* Back Wall Full Width */}
          <mesh
            position={[0, height / 2, -hd - wallThickness / 2]}
            receiveShadow
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectEmpty && onSelectEmpty();
            }}
          >
            <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Left Wall Full Depth */}
          <mesh
            position={[-hw - wallThickness / 2, height / 2, 0]}
            receiveShadow
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectEmpty && onSelectEmpty();
            }}
          >
            <boxGeometry args={[wallThickness, height, depth]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Inner L Corner Walls */}
          <mesh
            position={[hw / 2, height / 2, 0 + wallThickness / 2]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[hw + wallThickness, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          <mesh
            position={[0 + wallThickness / 2, height / 2, hd / 2]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[wallThickness, height, hd]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
        </>
      )}

      {shape === 'octagonal' && (
        <>
          {/* Back Center Segment */}
          <mesh
            position={[0, height / 2, -hd - wallThickness / 2]}
            receiveShadow
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectEmpty && onSelectEmpty();
            }}
          >
            <boxGeometry args={[width * 0.52, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Left Center Segment */}
          <mesh
            position={[-hw - wallThickness / 2, height / 2, 0]}
            receiveShadow
            castShadow
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectEmpty && onSelectEmpty();
            }}
          >
            <boxGeometry args={[wallThickness, height, depth * 0.52]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Back-Left Chamfer Wall */}
          <mesh
            position={[-hw * 0.75, height / 2, -hd * 0.75]}
            rotation={[0, Math.PI / 4, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[Math.hypot(width * 0.25, depth * 0.25) + 0.1, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>

          {/* Back-Right Chamfer Wall */}
          <mesh
            position={[hw * 0.75, height / 2, -hd * 0.75]}
            rotation={[0, -Math.PI / 4, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[Math.hypot(width * 0.25, depth * 0.25) + 0.1, height, wallThickness]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
        </>
      )}

      {/* Semi-transparent Ceiling Reference Plane */}
      {showCeiling && (
        <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <shapeGeometry args={[customFloorShape]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
