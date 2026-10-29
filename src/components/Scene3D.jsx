import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import RoomMesh from './RoomMesh';
import Lamp3D from './Lamp3D';
import Furniture3D from './Furniture3D';
import {
  RENDER_SCALE,
  BASE_AMBIENT_LUX,
  INDIRECT_AMBIENT_SHARE,
  indirectLux,
} from '../utils/lightingPhysics';

const MAX_SHADOW_LIGHTS = 4;

function CameraController({ cameraView, room, orbitEnabled }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    const maxDim = Math.max(room.width, room.depth);
    if (cameraView === 'top') {
      camera.position.set(0, maxDim * 1.65, 0.01);
    } else if (cameraView === 'front') {
      camera.position.set(0, room.height * 0.62, maxDim * 1.35);
    } else {
      // Isometric / Perspective 3D
      camera.position.set(maxDim * 0.95, room.height * 1.45, maxDim * 1.15);
    }
    if (controlsRef.current) {
      controlsRef.current.target.set(0, room.height * 0.3, 0);
      controlsRef.current.update();
    }
  }, [cameraView, room.width, room.depth, room.height, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={orbitEnabled}
      makeDefault
      minDistance={2}
      maxDistance={22}
      maxPolarAngle={Math.PI / 2 - 0.02}
      enableDamping
      dampingFactor={0.07}
    />
  );
}

export default function Scene3D({
  room,
  lamps,
  furniture,
  selectedId,
  selectedType,
  onSelectLamp,
  onSelectFurniture,
  onSelectEmpty,
  onUpdateLamp,
  onToggleLampPower,
  onUpdateFurniture,
  showGrid,
  ambientLevel,
  cameraView,
  hideUIForPhoto,
  canvasRef,
}) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  // Ambient = light bouncing off walls/ceiling (grows with the lamps' lumens) + a small
  // day/night base, so dim rooms look dim and bright rooms look bright.
  // Point-light shadows cost 6 renders each and a texture unit in every material: only the
  // brightest MAX_SHADOW_LIGHTS lit lamps cast them (the rest still light the room), so a room
  // with many lights stays fast and never exceeds WebGL's texture-unit limit (16 on phones).
  const shadowIds = useMemo(
    () =>
      new Set(
        lamps
          .filter((l) => l.isOn)
          .sort((a, b) => b.lumens - a.lumens)
          .slice(0, MAX_SHADOW_LIGHTS)
          .map((l) => l.id)
      ),
    [lamps]
  );

  const ambientLux = useMemo(() => {
    const lumens = lamps.reduce((acc, l) => acc + (l.isOn ? l.lumens : 0), 0);
    return indirectLux(lumens, room) * INDIRECT_AMBIENT_SHARE + ambientLevel * BASE_AMBIENT_LUX;
  }, [lamps, room, ambientLevel]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{ position: [5.5, 4.2, 6.5], fov: 45 }}
      >
        <color attach="background" args={['#090d16']} />

        {/* Ambient + hemisphere: inter-reflected light from the lamps plus the day/night base */}
        <ambientLight intensity={ambientLux * RENDER_SCALE * 0.6} color="#cbd5e1" />
        <hemisphereLight
          skyColor="#94a3b8"
          groundColor="#1e293b"
          intensity={ambientLux * RENDER_SCALE * 0.4}
        />

        <CameraController
          cameraView={cameraView}
          room={room}
          orbitEnabled={orbitEnabled}
        />

        {/* Room Walls & Floor */}
        <RoomMesh
          room={room}
          showGrid={showGrid && !hideUIForPhoto}
          onSelectEmpty={onSelectEmpty}
        />

        {/* Lamps */}
        {lamps.map((lamp) => (
          <Lamp3D
            key={lamp.id}
            lamp={lamp}
            room={room}
            isSelected={selectedType === 'lamp' && selectedId === lamp.id}
            onSelect={(id) => onSelectLamp(id)}
            onUpdate={onUpdateLamp}
            onTogglePower={onToggleLampPower}
            setOrbitEnabled={setOrbitEnabled}
            hideUI={hideUIForPhoto}
            castsShadow={shadowIds.has(lamp.id)}
          />
        ))}

        {/* Furniture */}
        {furniture.map((item) => (
          <Furniture3D
            key={item.id}
            item={item}
            room={room}
            isSelected={selectedType === 'furniture' && selectedId === item.id}
            onSelect={(id) => onSelectFurniture(id)}
            onUpdate={onUpdateFurniture}
            setOrbitEnabled={setOrbitEnabled}
            hideUI={hideUIForPhoto}
          />
        ))}
      </Canvas>
    </div>
  );
}
