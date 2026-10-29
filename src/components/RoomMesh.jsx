import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Grid } from '@react-three/drei';
import { FLOOR_MATERIALS, WALL_COLORS } from '../utils/lightingPhysics';

/** Height of a wall that faces the camera (cut so the room can be seen). */
const CUT_HEIGHT = 0.5;

/** Floor plan corners (x, z), counter-clockwise seen from above; same outlines as the floor. */
function floorOutline(width, depth, shape) {
  const hw = width / 2;
  const hd = depth / 2;
  if (shape === 'l-shape') {
    // the quadrant x > 0, z > 0 is outside the room
    return [[-hw, -hd], [-hw, hd], [0, hd], [0, 0], [hw, 0], [hw, -hd]];
  }
  if (shape === 'octagonal') {
    const cx = width * 0.25;
    const cz = depth * 0.25;
    return [
      [-hw + cx, -hd], [-hw, -hd + cz], [-hw, hd - cz], [-hw + cx, hd],
      [hw - cx, hd], [hw, hd - cz], [hw, -hd + cz], [hw - cx, -hd],
    ];
  }
  return [[-hw, -hd], [-hw, hd], [hw, hd], [hw, -hd]];
}

/**
 * One wall per side of the floor plan. Every frame, a wall whose outer face looks at the
 * camera (camera outside its plane) drops to CUT_HEIGHT, so whatever the angle the walls in
 * front are cut and the ones behind stay full height.
 */
function CutawayWalls({ outline, height, thickness, color, onSelectEmpty }) {
  const refs = useRef([]);
  const walls = useMemo(() => {
    // signed area tells the winding, so the outward normal is right for concave plans too
    let area = 0;
    outline.forEach(([x1, z1], i) => {
      const [x2, z2] = outline[(i + 1) % outline.length];
      area += x1 * z2 - x2 * z1;
    });
    const sign = area > 0 ? 1 : -1;
    return outline.map(([x1, z1], i) => {
      const [x2, z2] = outline[(i + 1) % outline.length];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const nx = (sign * dz) / len; // outward normal
      const nz = (sign * -dx) / len;
      return {
        mx: (x1 + x2) / 2,
        mz: (z1 + z2) / 2,
        nx,
        nz,
        len,
        angle: Math.atan2(dz, dx),
        inner: sign, // local z side of the room after the -angle rotation
      };
    });
  }, [outline]);

  useFrame(({ camera }) => {
    walls.forEach((w, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const facing = (camera.position.x - w.mx) * w.nx + (camera.position.z - w.mz) * w.nz > 0.05;
      const h = facing ? CUT_HEIGHT : height;
      // Compare with the mesh itself (not a cached value): a re-render (preset, size, color)
      // puts the JSX position back to full height, and it must be fixed on the same frame
      if (Math.abs(mesh.scale.y - h / height) > 1e-6 || Math.abs(mesh.position.y - h / 2) > 1e-6) {
        mesh.scale.y = h / height;
        mesh.position.y = h / 2;
      }
    });
  });

  return walls.map((w, i) => (
    <group key={i} position={[w.mx + (w.nx * thickness) / 2, 0, w.mz + (w.nz * thickness) / 2]} rotation={[0, -w.angle, 0]}>
      <mesh
        ref={(m) => (refs.current[i] = m)}
        position={[0, height / 2, 0]}
        receiveShadow
        castShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelectEmpty && onSelectEmpty();
        }}
      >
        <boxGeometry args={[w.len + thickness, height, thickness]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* baseboard on the inner face */}
      <mesh position={[0, 0.06, w.inner * (thickness / 2 + 0.0125)]} receiveShadow>
        <boxGeometry args={[w.len, 0.12, 0.025]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
    </group>
  ));
}

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
  const outline = useMemo(() => floorOutline(width, depth, shape), [width, depth, shape]);
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

      {/* Walls: every side of the floor plan; the ones between the camera and the room are cut low */}
      <CutawayWalls
        outline={outline}
        height={height}
        thickness={wallThickness}
        color={wallColor}
        onSelectEmpty={onSelectEmpty}
      />

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
