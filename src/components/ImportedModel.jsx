import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { buildModelRoot, makeCutPlane } from '../utils/modelImport';

/** Height a wall keeps when it is between the camera and the project (same as RoomMesh). */
const CUT_HEIGHT = 0.5;
const NO_CUT = 1e4;

/**
 * Wall-like pieces of the model: thin in one horizontal direction, long in the other and
 * above the cut height (walls, sills, lintels, glass, doors). Each one gets its own cut plane
 * (so its materials are cloned once) and the outward direction it faces, seen from the
 * middle of the project. Walls through the middle have no side and are never cut.
 * Models merged into a single mesh have no separate walls: only the ceiling cut applies.
 */
function findWalls(axis) {
  const walls = [];
  const box = new THREE.Box3();
  const c = new THREE.Vector3();
  axis.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    box.setFromObject(o);
    const dx = box.max.x - box.min.x;
    const dz = box.max.z - box.min.z;
    const thin = Math.min(dx, dz);
    const long = Math.max(dx, dz);
    if (thin > 0.35 || long < 0.3 || long < thin * 2 || box.max.y <= CUT_HEIGHT + 0.05) return;
    box.getCenter(c);
    const n = dz <= dx ? new THREE.Vector2(0, Math.sign(c.z)) : new THREE.Vector2(Math.sign(c.x), 0);
    if ((n.x === 0 && n.y === 0) || Math.abs(n.x ? c.x : c.z) < 0.3) return;
    if (!o.userData.wallPlane) {
      o.userData.wallPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), NO_CUT);
      o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
    }
    walls.push({ mesh: o, cx: c.x, cz: c.z, n });
  });
  return walls;
}

/** Ceiling plane on every material, plus the wall's own plane on wall pieces. */
function applyPlanes(axis, ceilPlane, cut) {
  axis.traverse((o) => {
    if (!o.isMesh) return;
    const planes = [];
    if (cut) planes.push(ceilPlane);
    if (cut && o.userData.wallPlane) planes.push(o.userData.wallPlane);
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      m.clippingPlanes = planes.length ? planes : null;
      m.needsUpdate = true;
    });
  });
}

/**
 * A project imported by the user (SketchUp, Revit, Promob…), shown like the built-in rooms:
 * cut just under the ceiling (roof and slab disappear) and, while "cut" is on, the walls
 * between the camera and the project drop to a low stub as the camera moves around.
 * The model takes no pointer events (raycasting a whole house on every move is slow):
 * an invisible floor plane handles "click on nothing".
 */
export default function ImportedModel({ model, room, showGrid, onSelectEmpty }) {
  const { gl } = useThree();
  const ceilPlane = useMemo(() => makeCutPlane(), []);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  const { root, walls } = useMemo(() => {
    const built = buildModelRoot(model.object, model.setup);
    return { root: built.root, walls: findWalls(built.root) };
  }, [model.object, model.setup]);

  useEffect(() => {
    applyPlanes(root, ceilPlane, model.setup.cut);
  }, [root, ceilPlane, model.setup.cut]);

  // cutting just under the ceiling removes the whole slab (cutting through a slab would show
  // its inside faces as a lid over the rooms)
  ceilPlane.constant = room.height - 0.01;

  useFrame(({ camera }) => {
    if (!model.setup.cut) return;
    walls.forEach((w) => {
      const facing = (camera.position.x - w.cx) * w.n.x + (camera.position.z - w.cz) * w.n.y > 0.05;
      w.mesh.userData.wallPlane.constant = facing ? CUT_HEIGHT : NO_CUT;
    });
  });

  const w = Math.max(room.width, 1);
  const d = Math.max(room.depth, 1);

  return (
    <group>
      <primitive object={root} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelectEmpty && onSelectEmpty();
        }}
      >
        <planeGeometry args={[w + 2, d + 2]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {showGrid && (
        <Grid
          position={[0, 0.01, 0]}
          args={[w, d]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#64748b"
          sectionSize={1}
          sectionThickness={1.1}
          sectionColor="#94a3b8"
          fadeDistance={Math.max(25, w * 2)}
          fadeStrength={1}
        />
      )}
    </group>
  );
}
