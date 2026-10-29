import * as THREE from 'three';

/**
 * Phase 1 of the project import: 3D models exported from SketchUp, Revit, ArchiCAD, Promob,
 * Blender… Everything is read in the browser — the file never leaves the visitor's computer.
 */
export const MODEL_FORMATS = ['glb', 'gltf', 'obj', 'fbx', 'dae'];
const FILE_TYPES = '.glb,.gltf,.obj,.mtl,.fbx,.dae,.bin,.png,.jpg,.jpeg,.webp,.bmp,.tga';
// iOS greys out files whose type it does not know (.glb, .fbx…) when the picker is filtered
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
export const MODEL_ACCEPT = IS_IOS ? undefined : FILE_TYPES;

/** Unit of the file → meters. */
export const MODEL_UNITS = [
  { id: 'm', scale: 1 },
  { id: 'cm', scale: 0.01 },
  { id: 'mm', scale: 0.001 },
  { id: 'in', scale: 0.0254 },
  { id: 'ft', scale: 0.3048 },
];

const ext = (name) => name.split('.').pop().toLowerCase();
const base = (path) => decodeURIComponent(path).split(/[\\/]/).pop().toLowerCase();

/** Picks the model among the chosen files (the others are .mtl, .bin, textures). */
export function pickModelFile(files) {
  const list = Array.from(files);
  for (const f of MODEL_FORMATS) {
    const hit = list.find((file) => ext(file.name) === f);
    if (hit) return hit;
  }
  return null;
}

/**
 * Loads the model. Companion files (OBJ's .mtl, glTF's .bin, textures) are resolved by file
 * name, so the user selects them together with the model.
 */
export async function loadModel(files) {
  const list = Array.from(files);
  const main = pickModelFile(list);
  if (!main) {
    const err = new Error('unsupported');
    err.code = 'unsupported';
    throw err;
  }
  const format = ext(main.name);

  const urls = new Map(list.map((f) => [f.name.toLowerCase(), URL.createObjectURL(f)]));
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    return urls.get(base(url)) || url;
  });
  const mainUrl = urls.get(main.name.toLowerCase());

  try {
    let object;
    if (format === 'glb' || format === 'gltf') {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader(manager).loadAsync(mainUrl);
      object = gltf.scene;
    } else if (format === 'obj') {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const loader = new OBJLoader(manager);
      const mtl = list.find((f) => ext(f.name) === 'mtl');
      if (mtl) {
        const { MTLLoader } = await import('three/examples/jsm/loaders/MTLLoader.js');
        const materials = await new MTLLoader(manager).loadAsync(urls.get(mtl.name.toLowerCase()));
        materials.preload();
        loader.setMaterials(materials);
      }
      object = await loader.loadAsync(mainUrl);
    } else if (format === 'fbx') {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      object = await new FBXLoader(manager).loadAsync(mainUrl);
    } else {
      // COLLADA already applies the file's unit and Z-up axis
      const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js');
      const dae = await new ColladaLoader(manager).loadAsync(mainUrl);
      object = dae.scene;
    }
    prepareMaterials(object);
    return { object, name: main.name, format };
  } finally {
    // OBJ/FBX textures may still be loading after the model resolves: free the blobs later
    setTimeout(() => urls.forEach((u) => URL.revokeObjectURL(u)), 60000);
  }
}

/** Shared cut plane: keeps what is below the ceiling height (constant = cut height). */
export function makeCutPlane() {
  return new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);
}

/**
 * Shadows on every mesh, both faces drawn (SketchUp/Revit exports often have flipped faces),
 * unlit materials turned into lit ones, and edge lines hidden (they ignore the lighting).
 */
function prepareMaterials(object) {
  object.traverse((o) => {
    // the project's own lights are not rendered: they become lamps the user controls
    if (o.isLight) {
      o.visible = false;
      return;
    }
    if (o.isLine || o.isLineSegments || o.isPoints) {
      o.visible = false;
      return;
    }
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const fix = (m) => {
      let mat = m;
      if (!mat) return new THREE.MeshStandardMaterial({ color: '#d4d4d8', roughness: 0.85 });
      if (mat.isMeshBasicMaterial) {
        mat = new THREE.MeshStandardMaterial({
          color: m.color,
          map: m.map,
          transparent: m.transparent,
          opacity: m.opacity,
          roughness: 0.85,
        });
      }
      mat.side = THREE.DoubleSide;
      mat.clipShadows = true;
      return mat;
    };
    o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material);
  });
}

/** Puts the same cut plane on every material of the model. */
export function applyCutPlane(object, plane) {
  object.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      m.clippingPlanes = plane ? [plane] : null;
      m.needsUpdate = true;
    });
  });
}

/** Size (m) of the model with the given unit scale and axis, before centering. */
function measure(object, scale, zUp) {
  const holder = new THREE.Group();
  const parent = object.parent;
  holder.rotation.x = zUp ? -Math.PI / 2 : 0;
  holder.scale.setScalar(scale);
  holder.add(object);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder);
  holder.remove(object);
  if (parent) parent.add(object);
  return box;
}

/**
 * Guesses the unit and the up axis. glTF is meters by spec and COLLADA carries its unit, so
 * those stay as they are unless absurd. A house or apartment is a few meters to a few dozen.
 */
export function guessSetup(object, format) {
  const raw = measure(object, 1, false).getSize(new THREE.Vector3());
  let zUp = false;
  if ((format === 'obj' || format === 'fbx') && raw.y > Math.max(raw.x, raw.z) * 1.3) zUp = true;
  const maxDim = Math.max(raw.x, raw.y, raw.z);
  let unit = 'm';
  if (maxDim > 80) unit = maxDim / 100 <= 80 ? 'cm' : 'mm';
  if ((format === 'glb' || format === 'gltf' || format === 'dae') && maxDim <= 400) unit = 'm';
  return { unit, zUp };
}

/**
 * Places the model: unit → meters, chosen up axis, centered on x/z, lowest point at y = 0,
 * then lowered by floorLevel (to stand on a raised floor or pick an upper story).
 * Returns the root to render and the size in meters.
 */
export function buildModelRoot(object, { unit, zUp, floorLevel = 0 }) {
  const scale = (MODEL_UNITS.find((u) => u.id === unit) || MODEL_UNITS[0]).scale;
  const root = new THREE.Group();
  const axis = new THREE.Group();
  axis.rotation.x = zUp ? -Math.PI / 2 : 0;
  axis.scale.setScalar(scale);
  axis.add(object);
  root.add(axis);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(axis);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  axis.position.set(-center.x, -box.min.y - floorLevel, -center.z);
  return {
    root,
    lights: extractLights(root),
    ceiling: detectCeiling(axis, size),
    size: {
      x: Number(size.x.toFixed(2)),
      y: Number(size.y.toFixed(2)),
      z: Number(size.z.toFixed(2)),
    },
  };
}

/** Polygon count, to warn about very heavy models. */
export function countTriangles(object) {
  let n = 0;
  object.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const g = o.geometry;
    n += g.index ? g.index.count / 3 : (g.attributes.position?.count || 0) / 3;
  });
  return Math.round(n);
}

/**
 * Lamps of the project (GLB, FBX and DAE can carry them; OBJ and SketchUp cannot), in the
 * simulator's meters. Sun and ambient lights are left out: only fixtures matter here.
 */
function extractLights(root) {
  root.updateMatrixWorld(true);
  const found = [];
  const p = new THREE.Vector3();
  root.traverse((o) => {
    if (!(o.isPointLight || o.isSpotLight || o.isRectAreaLight)) return;
    o.getWorldPosition(p);
    found.push({
      x: Number(p.x.toFixed(2)),
      y: Number(p.y.toFixed(2)),
      z: Number(p.z.toFixed(2)),
      spot: !!o.isSpotLight,
      color: o.color ? { r: o.color.r, g: o.color.g, b: o.color.b } : null,
      name: o.name || '',
    });
  });
  return found;
}

/** Color temperature guessed from a light's color (warm, neutral or cool white). */
export function kelvinFromColor(color) {
  if (!color) return 3000;
  const warmth = color.r - color.b;
  if (warmth > 0.25) return 2700;
  if (warmth > 0.08) return 3000;
  if (warmth > -0.05) return 4000;
  return 6500;
}

/**
 * Ceiling height of the project: the lowest big flat piece (slab or ceiling lining) between
 * 2 and 4.5 m. Cutting just under it removes the slab; a wrong ceiling would cut through it
 * and show its inside as a lid. Models merged into a single mesh give no answer (null).
 */
function detectCeiling(axis, size) {
  const footprint = size.x * size.z;
  if (!footprint) return null;
  const box = new THREE.Box3();
  let best = null;
  axis.updateMatrixWorld(true);
  axis.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    box.setFromObject(o);
    const h = box.max.y - box.min.y;
    const area = (box.max.x - box.min.x) * (box.max.z - box.min.z);
    if (h > 0.45 || area < footprint * 0.25) return;
    if (box.min.y < 2.0 || box.min.y > 4.5) return;
    if (best === null || box.min.y < best) best = box.min.y;
  });
  return best === null ? null : Number(best.toFixed(2));
}

/** Lamp type from the light's name in the file (Portuguese, English, Spanish), if it says. */
export function lampTypeFromName(name = '') {
  const n = name.toLowerCase();
  if (/pendente|pendant|colgante|lustre|chandelier|ara[ñn]a/.test(n)) return 'pendant';
  if (/spot|embutid|downlight|recessed|empotrad/.test(n)) return 'spot';
  if (/plafon|plaf[oó]n|ceiling|teto|techo/.test(n)) return 'plafon';
  if (/piso|floor|coluna|abajur|pie|de p[eé]/.test(n)) return 'floor_lamp';
  return null;
}

/** Light names worth showing (exporters' defaults like "PointLight" or "Light.001" are not). */
export function usefulLightName(name = '') {
  const n = name.trim();
  if (!n || /^(point|spot|area|rect)?\s*light[\s._-]*\d*$/i.test(n) || /^luz[\s._-]*\d*$/i.test(n)) return null;
  return n.replace(/_/g, ' ');
}
