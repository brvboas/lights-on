import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function Furniture3D({
  item,
  room,
  isSelected,
  onSelect,
  onUpdate,
  setOrbitEnabled,
  hideUI,
}) {
  const { id, type, name, x, z, rotation = 0, scale = 1, color } = item;
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { raycaster, camera, gl } = useThree();

  const floorPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );

  const handlePointerDown = (e) => {
    e.stopPropagation();
    onSelect(id);
    setIsDragging(true);
    setOrbitEnabled(false);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const intersectPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(floorPlane, intersectPoint)) {
      const margin = 0.55;
      const halfW = room.width / 2 - margin;
      const halfD = room.depth / 2 - margin;

      let nx = Math.max(-halfW, Math.min(halfW, intersectPoint.x));
      let nz = Math.max(-halfD, Math.min(halfD, intersectPoint.z));

      if (room.shape === 'l-shape' && nx > -margin && nz > -margin) {
        if (nx > nz) {
          nz = -margin;
        } else {
          nx = -margin;
        }
      }

      onUpdate(id, {
        x: Number(nx.toFixed(2)),
        z: Number(nz.toFixed(2)),
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    setOrbitEnabled(true);
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const rad = (rotation * Math.PI) / 180;

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, rad, 0]}
      scale={[scale, scale, scale]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = isDragging ? 'grabbing' : 'grab';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. 3-Seater Sofa */}
      {type === 'sofa' && (
        <group>
          {/* Base/Seat */}
          <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 0.32, 0.9]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.56, -0.35]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 0.55, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Left Armrest */}
          <mesh position={[-0.95, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.48, 0.92]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          {/* Right Armrest */}
          <mesh position={[0.95, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.48, 0.92]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          {/* Decorative Pillows */}
          <mesh position={[-0.65, 0.52, -0.15]} rotation={[0.2, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.35, 0.32, 0.12]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.7} />
          </mesh>
          <mesh position={[0.65, 0.52, -0.15]} rotation={[0.2, -0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.35, 0.32, 0.12]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* 2. Dining Table */}
      {type === 'dining_table' && (
        <group>
          {/* Table Top */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.06, 0.95]} />
            <meshStandardMaterial color={color} roughness={0.45} />
          </mesh>
          {/* 4 Legs */}
          {[
            [-0.7, -0.38],
            [0.7, -0.38],
            [-0.7, 0.38],
            [0.7, 0.38],
          ].map(([lx, lz], idx) => (
            <mesh key={idx} position={[lx, 0.37, lz]} castShadow receiveShadow>
              <cylinderGeometry args={[0.035, 0.025, 0.74, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
          {/* Center Vase on Table */}
          <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* 3. Queen Bed */}
      {type === 'bed' && (
        <group>
          {/* Bed Frame */}
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.65, 0.28, 2.05]} />
            <meshStandardMaterial color="#4a3222" roughness={0.6} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.38, 0.02]} castShadow receiveShadow>
            <boxGeometry args={[1.55, 0.24, 1.92]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.75} />
          </mesh>
          {/* Blanket / Duvet */}
          <mesh position={[0, 0.4, 0.28]} castShadow receiveShadow>
            <boxGeometry args={[1.57, 0.23, 1.35]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, 0.62, -0.96]} castShadow receiveShadow>
            <boxGeometry args={[1.68, 0.92, 0.12]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Two Pillows */}
          <mesh position={[-0.4, 0.54, -0.68]} castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.11, 0.36]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
          <mesh position={[0.4, 0.54, -0.68]} castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.11, 0.36]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* 4. Office Desk + Monitor */}
      {type === 'desk' && (
        <group>
          {/* Desk Top */}
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 0.05, 0.68]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* Side Frame Left & Right */}
          <mesh position={[-0.6, 0.37, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, 0.73, 0.62]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.6, 0.37, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, 0.73, 0.62]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Monitor / Laptop on Desk */}
          <mesh position={[0, 0.92, -0.12]} castShadow receiveShadow>
            <boxGeometry args={[0.48, 0.28, 0.025]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Office Chair */}
          <mesh position={[0, 0.44, 0.42]} castShadow receiveShadow>
            <boxGeometry args={[0.48, 0.07, 0.46]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.72, 0.62]} castShadow receiveShadow>
            <boxGeometry args={[0.44, 0.52, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* 5. Tall Bookshelf */}
      {type === 'bookshelf' && (
        <group>
          {/* Left & Right Pillars */}
          <mesh position={[-0.46, 0.92, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, 1.84, 0.38]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          <mesh position={[0.46, 0.92, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, 1.84, 0.38]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          {/* 5 Shelves */}
          {[0.1, 0.5, 0.9, 1.3, 1.75].map((sy, idx) => (
            <mesh key={idx} position={[0, sy, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.96, 0.04, 0.38]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          ))}
          {/* Decorative Books */}
          <mesh position={[-0.2, 1.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.24, 0.22]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[0.18, 0.64, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.28, 0.22, 0.22]} />
            <meshStandardMaterial color="#2563eb" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* 6. Reading Armchair */}
      {type === 'armchair' && (
        <group>
          <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.82, 0.3, 0.82]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.56, -0.31]} castShadow receiveShadow>
            <boxGeometry args={[0.82, 0.54, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          <mesh position={[-0.34, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.44, 0.84]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          <mesh position={[0.34, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.44, 0.84]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        </group>
      )}

      {/* 7. Potted Ficus Plant */}
      {type === 'plant' && (
        <group>
          {/* Ceramic Pot */}
          <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.16, 0.48, 24]} />
            <meshStandardMaterial color="#d6d3d1" roughness={0.4} />
          </mesh>
          {/* Trunk */}
          <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.65, 12]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>
          {/* Foliage Clusters */}
          <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.34, 20, 20]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0.18, 0.96, 0.12]} castShadow receiveShadow>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[-0.16, 1.02, -0.1]} castShadow receiveShadow>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Selection Ring on Floor */}
      {!hideUI && (isSelected || hovered || isDragging) && (
        <group>
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.68, 0.75, 36]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#94a3b8'}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Html position={[0, 1.15, 0]} center distanceFactor={8}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shadow-md backdrop-blur-md border select-none ${
                isSelected
                  ? 'bg-sky-500/90 text-slate-950 border-sky-300 font-semibold'
                  : 'bg-slate-900/80 text-slate-200 border-slate-700'
              }`}
            >
              {name} ({rotation}°)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
