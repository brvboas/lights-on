import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { kelvinToHex, RENDER_SCALE } from '../utils/lightingPhysics';

export default function Lamp3D({
  lamp,
  room,
  isSelected,
  onSelect,
  onUpdate,
  onTogglePower,
  setOrbitEnabled,
  hideUI,
  castsShadow = true,
}) {
  const { id, name, type, x, z, isOn, kelvin, lumens, scale, heightOffset = 0 } = lamp;
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { raycaster, camera, gl } = useThree();

  const colorHex = useMemo(() => kelvinToHex(kelvin), [kelvin]);

  // Calculate vertical position based on fixture type & room height
  const ceilingY = room.height;
  const bulbY = useMemo(() => {
    if (type === 'floor_lamp') {
      return Math.min(ceilingY - 0.3, 1.55 * scale);
    }
    if (type === 'pendant') {
      return Math.max(1.2, ceilingY - 0.65 * scale + heightOffset);
    }
    // plafon or spot sits right under ceiling
    return ceilingY - 0.08 * scale;
  }, [type, ceilingY, scale, heightOffset]);

  // Lumens → candela (isotropic source: lm ÷ 4π), scaled to the render calibration
  const lightIntensity = useMemo(() => {
    if (!isOn) return 0;
    return (lumens / (4 * Math.PI)) * RENDER_SCALE;
  }, [isOn, lumens]);

  const dragPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -bulbY),
    [bulbY]
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
    if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
      const margin = 0.35;
      const halfW = room.width / 2 - margin;
      const halfD = room.depth / 2 - margin;

      let nx = Math.max(-halfW, Math.min(halfW, intersectPoint.x));
      let nz = Math.max(-halfD, Math.min(halfD, intersectPoint.z));

      // Keep inside L-shape cutout if room is L-shape
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
      // ignore if capture already lost
    }
  };

  const bulbRadius = 0.14 * scale;

  return (
    <group position={[x, 0, z]}>
      {/* Real 3D PointLight casting shadows across furniture and walls */}
      <pointLight
        position={[0, bulbY - (type === 'plafon' ? 0.08 : 0.02), 0]}
        color={colorHex}
        intensity={lightIntensity}
        // distance also bounds the shadow camera (far = distance); 0 would mean far = 500 m and
        // blurry, imprecise shadows. At 2.5× the room size the cut-off barely dims the light.
        distance={Math.max(room.width, room.depth) * 2.5}
        decay={2}
        castShadow={castsShadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0015}
        shadow-radius={3}
      />

      {/* Fixture Geometry */}
      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onTogglePower(id);
        }}
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
        {/* Invisible larger hit-area sphere for easier grabbing */}
        <mesh position={[0, bulbY, 0]}>
          <sphereGeometry args={[Math.max(0.28, bulbRadius * 2.2), 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Type 1: Globe Pendant Lamp */}
        {type === 'pendant' && (
          <group>
            {/* Ceiling Canopy */}
            <mesh position={[0, ceilingY - 0.02, 0]}>
              <cylinderGeometry args={[0.07 * scale, 0.07 * scale, 0.04, 20]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Suspension Cord */}
            <mesh position={[0, (ceilingY + bulbY) / 2, 0]}>
              <cylinderGeometry args={[0.012, 0.012, Math.max(0.1, ceilingY - bulbY), 8]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* Upper Metal Cap */}
            <mesh position={[0, bulbY + bulbRadius * 0.85, 0]}>
              <cylinderGeometry args={[bulbRadius * 0.35, bulbRadius * 0.75, bulbRadius * 0.5, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glowing Glass Globe */}
            <mesh position={[0, bulbY, 0]}>
              <sphereGeometry args={[bulbRadius, 32, 32]} />
              <meshStandardMaterial
                color={isOn ? colorHex : '#cbd5e1'}
                emissive={isOn ? colorHex : '#000000'}
                emissiveIntensity={isOn ? Math.min(4.5, 1.2 + lumens / 900) : 0}
                roughness={0.15}
              />
            </mesh>
          </group>
        )}

        {/* Type 2: Surface-Mounted LED Plafon */}
        {type === 'plafon' && (
          <group position={[0, ceilingY - 0.04 * scale, 0]}>
            {/* Metal Housing Rim */}
            <mesh position={[0, 0.015 * scale, 0]}>
              <cylinderGeometry args={[0.26 * scale, 0.26 * scale, 0.05 * scale, 32]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.4} />
            </mesh>
            {/* Acrylic Diffuser Plate */}
            <mesh position={[0, -0.012 * scale, 0]}>
              <cylinderGeometry args={[0.23 * scale, 0.23 * scale, 0.015 * scale, 32]} />
              <meshStandardMaterial
                color={isOn ? colorHex : '#e2e8f0'}
                emissive={isOn ? colorHex : '#000000'}
                emissiveIntensity={isOn ? Math.min(4.0, 1.0 + lumens / 1000) : 0}
                roughness={0.2}
              />
            </mesh>
          </group>
        )}

        {/* Type 3: Directional Track Spot */}
        {type === 'spot' && (
          <group position={[0, ceilingY - 0.06 * scale, 0]}>
            {/* Base Track */}
            <mesh position={[0, 0.03 * scale, 0]}>
              <boxGeometry args={[0.32 * scale, 0.04 * scale, 0.12 * scale]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Spot Cylinder */}
            <mesh position={[0, -0.04 * scale, 0]}>
              <cylinderGeometry args={[0.09 * scale, 0.11 * scale, 0.14 * scale, 24]} />
              <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Glowing LED Lens */}
            <mesh position={[0, -0.112 * scale, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.095 * scale, 24]} />
              <meshStandardMaterial
                color={isOn ? colorHex : '#94a3b8'}
                emissive={isOn ? colorHex : '#000000'}
                emissiveIntensity={isOn ? Math.min(5, 1.5 + lumens / 800) : 0}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Type 4: Standing Floor Lamp */}
        {type === 'floor_lamp' && (
          <group>
            {/* Floor Base Disc */}
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.22 * scale, 0.24 * scale, 0.04, 28]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Vertical Stand Pole */}
            <mesh position={[0, bulbY / 2, 0]} castShadow>
              <cylinderGeometry args={[0.022 * scale, 0.028 * scale, bulbY, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Translucent Drum Shade */}
            <mesh position={[0, bulbY, 0]}>
              <cylinderGeometry args={[0.18 * scale, 0.24 * scale, 0.34 * scale, 32, 1, true]} />
              <meshStandardMaterial
                color={isOn ? colorHex : '#f1f5f9'}
                emissive={isOn ? colorHex : '#000000'}
                emissiveIntensity={isOn ? Math.min(2.8, 0.7 + lumens / 1200) : 0}
                transparent
                opacity={0.92}
                side={THREE.DoubleSide}
                roughness={0.5}
              />
            </mesh>
            {/* Inner Bulb */}
            <mesh position={[0, bulbY, 0]}>
              <sphereGeometry args={[0.07 * scale, 16, 16]} />
              <meshStandardMaterial
                color={isOn ? colorHex : '#cbd5e1'}
                emissive={isOn ? colorHex : '#000000'}
                emissiveIntensity={isOn ? 3.5 : 0}
              />
            </mesh>
          </group>
        )}

        {/* Soft Volumetric Glow Halo when Lamp is ON */}
        {isOn && (
          <mesh position={[0, bulbY, 0]}>
            <sphereGeometry args={[bulbRadius * 2.4, 24, 24]} />
            <meshBasicMaterial
              color={colorHex}
              transparent
              opacity={Math.min(0.28, 0.08 + (lumens / 3500) * 0.2)}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Visual Alignment Guide & Floor Ring when Selected or Hovered */}
      {!hideUI && (isSelected || hovered || isDragging) && (
        <group>
          {/* Vertical Laser Line to Floor */}
          <Line
            points={[
              [0, bulbY, 0],
              [0, 0.01, 0],
            ]}
            color={isSelected ? '#f59e0b' : '#94a3b8'}
            lineWidth={1.5}
            dashed
            dashScale={12}
            dashSize={0.6}
            gapSize={0.4}
          />

          {/* Target Ring on Floor */}
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.24, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#f59e0b' : '#cbd5e1'}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Floating Mini Badge in 3D */}
          <Html position={[0, bulbY + 0.28 * scale, 0]} center distanceFactor={8} zIndexRange={[15, 0]}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-md border transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500/90 text-slate-950 border-amber-300 scale-105'
                  : 'bg-slate-900/85 text-slate-100 border-slate-700/80'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-black/30"
                style={{
                  backgroundColor: isOn ? colorHex : '#475569',
                  boxShadow: isOn ? `0 0 8px ${colorHex}` : 'none',
                }}
              />
              <span>{name}</span>
              <span className="opacity-75">• {isOn ? `${kelvin}K` : 'OFF'}</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
