import { LED_LM_PER_W, reflectanceFromHex } from './illuminance';

/**
 * Approximates correlated color temperature (Kelvin) to an RGB hex string
 * using Tanner Helland's blackbody radiation algorithm.
 *
 * @param {number} kelvin - Color temperature in Kelvin (1000K - 40000K)
 * @returns {string} Hexadecimal RGB color string (e.g., "#ffb46b")
 */
export function kelvinToHex(kelvin) {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r, g, b;

  // Red channel
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green channel
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue channel
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Average luminous efficacy of a residential LED bulb (~95 lm/W)
export const LED_LUMENS_PER_WATT = LED_LM_PER_W;

export function wattsToLumens(watts) {
  return Math.round(watts * LED_LUMENS_PER_WATT);
}

export function lumensToWatts(lumens) {
  return Number((lumens / LED_LUMENS_PER_WATT).toFixed(1));
}

export const WATT_PRESETS = [
  { watts: 5, lumens: 475, label: '5W' },
  { watts: 9, lumens: 850, label: '9W' },
  { watts: 12, lumens: 1140, label: '12W' },
  { watts: 15, lumens: 1425, label: '15W' },
  { watts: 24, lumens: 2280, label: '24W' },
  { watts: 40, lumens: 3800, label: '40W' },
];

export const FLOOR_MATERIALS = [
  { id: 'wood_warm', name: 'Honey Oak', color: '#8c6239', roughness: 0.55 },
  { id: 'wood_dark', name: 'Dark Walnut', color: '#4a3222', roughness: 0.5 },
  { id: 'porcelain_gray', name: 'Gray Porcelain', color: '#7c8288', roughness: 0.25 },
  { id: 'marble_light', name: 'Travertine Marble', color: '#d8d2c7', roughness: 0.2 },
  { id: 'cement', name: 'Burnt Cement', color: '#595d60', roughness: 0.65 },
];

export const WALL_COLORS = [
  { id: 'off_white', name: 'Snow White', color: '#f4f4f0' },
  { id: 'sand', name: 'Sand / Linen', color: '#dfd9cd' },
  { id: 'sage', name: 'Sage Green', color: '#b8c4b9' },
  { id: 'terracotta', name: 'Soft Terracotta', color: '#c88a74' },
  { id: 'navy_slate', name: 'Petrol Blue', color: '#3b4d5e' },
  { id: 'charcoal', name: 'Dark Charcoal', color: '#36393f' },
];

export const FURNITURE_CATALOG = [
  {
    type: 'sofa',
    name: '3-Seater Sofa',
    icon: 'Sofa',
    defaultColor: '#475569',
    dimensions: [2.2, 0.85, 0.95],
  },
  {
    type: 'dining_table',
    name: 'Dining Table',
    icon: 'Table',
    defaultColor: '#78350f',
    dimensions: [1.6, 0.78, 0.95],
  },
  {
    type: 'bed',
    name: 'Queen Bed',
    icon: 'BedDouble',
    defaultColor: '#e2e8f0',
    dimensions: [1.6, 0.65, 2.0],
  },
  {
    type: 'desk',
    name: 'Office Desk',
    icon: 'Laptop',
    defaultColor: '#92400e',
    dimensions: [1.3, 0.75, 0.65],
  },
  {
    type: 'bookshelf',
    name: 'Tall Bookshelf',
    icon: 'BookOpen',
    defaultColor: '#5c4033',
    dimensions: [1.0, 1.85, 0.4],
  },
  {
    type: 'armchair',
    name: 'Reading Armchair',
    icon: 'Armchair',
    defaultColor: '#b45309',
    dimensions: [0.85, 0.85, 0.85],
  },
  {
    type: 'plant',
    name: 'Ficus Plant',
    icon: 'Trees',
    defaultColor: '#15803d',
    dimensions: [0.6, 1.45, 0.6],
  },
];

export const SCENE_PRESETS = {
  living_room: {
    labelKey: 'presetLiving',
    room: {
      width: 5.5,
      depth: 4.5,
      height: 2.8,
      shape: 'rectangular',
      roomType: 'living',
      floorMaterialId: 'wood_warm',
      wallColorId: 'sand',
      showCeiling: false,
    },
    lamps: [
      {
        id: 'lamp-1',
        nameKey: 'centralPendant',
        name: 'Central Pendant',
        type: 'pendant',
        x: 0,
        z: 0.2,
        isOn: true,
        kelvin: 2700,
        watts: 12,
        lumens: 1140,
        scale: 1.15,
        heightOffset: 0,
      },
      {
        id: 'lamp-2',
        nameKey: 'cornerFloorLamp',
        name: 'Corner Floor Lamp',
        type: 'floor_lamp',
        x: -1.9,
        z: -1.3,
        isOn: true,
        kelvin: 2200,
        watts: 7,
        lumens: 665,
        scale: 1.0,
        heightOffset: 0,
      },
    ],
    furniture: [
      {
        id: 'furn-1',
        type: 'sofa',
        name: '3-Seater Sofa',
        x: 0,
        z: -1.3,
        rotation: 0,
        scale: 1,
        color: '#475569',
      },
      {
        id: 'furn-2',
        type: 'plant',
        name: 'Ficus Plant',
        x: 2.0,
        z: -1.5,
        rotation: 0,
        scale: 1.1,
        color: '#15803d',
      },
      {
        id: 'furn-3',
        type: 'armchair',
        name: 'Reading Armchair',
        x: -1.6,
        z: 0.5,
        rotation: 65,
        scale: 1,
        color: '#b45309',
      },
    ],
  },
  office_studio: {
    labelKey: 'presetOffice',
    room: {
      width: 4.8,
      depth: 4.2,
      height: 2.7,
      shape: 'l-shape',
      roomType: 'office',
      floorMaterialId: 'porcelain_gray',
      wallColorId: 'off_white',
      showCeiling: false,
    },
    lamps: [
      {
        id: 'lamp-1',
        nameKey: 'mainPlafon',
        name: 'Main Plafon',
        type: 'plafon',
        x: -0.8,
        z: -0.6,
        isOn: true,
        kelvin: 4000,
        watts: 24,
        lumens: 2280,
        scale: 1.2,
        heightOffset: 0,
      },
      {
        id: 'lamp-2',
        nameKey: 'deskSpot',
        name: 'Desk Spot',
        type: 'spot',
        x: -1.1,
        z: -1.3,
        isOn: true,
        kelvin: 6500,
        watts: 12,
        lumens: 1140,
        scale: 1.0,
        heightOffset: 0,
      },
    ],
    furniture: [
      {
        id: 'furn-1',
        type: 'desk',
        name: 'Office Desk',
        x: -1.0,
        z: -1.3,
        rotation: 0,
        scale: 1.05,
        color: '#92400e',
      },
      {
        id: 'furn-2',
        type: 'bookshelf',
        name: 'Tall Bookshelf',
        x: -2.0,
        z: 0.2,
        rotation: 90,
        scale: 1,
        color: '#5c4033',
      },
    ],
  },
  cozy_bedroom: {
    labelKey: 'presetBedroom',
    room: {
      width: 5.0,
      depth: 4.6,
      height: 2.75,
      shape: 'octagonal',
      roomType: 'bedroom',
      floorMaterialId: 'wood_dark',
      wallColorId: 'sage',
      showCeiling: false,
    },
    lamps: [
      {
        id: 'lamp-1',
        nameKey: 'bedroomPendant',
        name: 'Bedroom Pendant',
        type: 'pendant',
        x: 0,
        z: 0.2,
        isOn: true,
        kelvin: 2700,
        watts: 9,
        lumens: 850,
        scale: 1.1,
        heightOffset: 0,
      },
      {
        id: 'lamp-2',
        nameKey: 'bedsideFloorLamp',
        name: 'Bedside Floor Lamp',
        type: 'floor_lamp',
        x: -1.3,
        z: -1.2,
        isOn: true,
        kelvin: 2200,
        watts: 5,
        lumens: 475,
        scale: 0.9,
        heightOffset: 0,
      },
    ],
    furniture: [
      {
        id: 'furn-1',
        type: 'bed',
        name: 'Queen Bed',
        x: 0,
        z: -0.9,
        rotation: 0,
        scale: 1,
        color: '#cbd5e1',
      },
      {
        id: 'furn-2',
        type: 'plant',
        name: 'Ficus Plant',
        x: 1.5,
        z: -1.1,
        rotation: 0,
        scale: 1,
        color: '#15803d',
      },
    ],
  },
};

/** Room types offered in the simulator (lux targets live in illuminance.js → ROOM_LUX). */
export const ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining', 'hallway', 'laundry'];

/**
 * Calculates usable floor area in square meters based on room geometry
 * (same outlines as RoomMesh: L-shape drops one quadrant, octagon cuts 25% × 25% corners).
 */
export function calculateRoomArea(room) {
  const fullArea = room.width * room.depth;
  if (room.shape === 'l-shape') {
    return Number((fullArea * 0.75).toFixed(1));
  }
  if (room.shape === 'octagonal') {
    return Number((fullArea * 0.875).toFixed(1));
  }
  return Number(fullArea.toFixed(1));
}

/** Floor perimeter in meters (the L-shape keeps the rectangle's perimeter). */
export function calculateRoomPerimeter(room) {
  const { width: w, depth: d } = room;
  if (room.shape === 'octagonal') {
    return w + d + Math.hypot(w, d);
  }
  return 2 * (w + d);
}

/** Geometry for the lumen method (area, perimeter, ceiling height). */
export function roomGeometry(room) {
  return {
    area: calculateRoomArea(room),
    perimeter: calculateRoomPerimeter(room),
    height: room.height,
  };
}

/**
 * 3D render calibration. Lights use physical units scaled by RENDER_SCALE, so that what you
 * see follows the lux figure: a room near 150–300 lux looks normally lit on screen and a
 * room at 30 lux looks dim. Lamps: candela = lumens ÷ 4π (inverse-square falloff).
 */
export const RENDER_SCALE = 0.025;

/**
 * Share of the inter-reflected light used as the (shadowless) ambient light. The full
 * integrating-sphere value washes out every shadow, because three.js ambient light reaches
 * all surfaces equally, even under furniture.
 */
export const INDIRECT_AMBIENT_SHARE = 0.35;

/** Base ambient (lux) per unit of the day/night toggle, so the room never goes pitch black. */
export const BASE_AMBIENT_LUX = 40;

const CEILING_REFLECTANCE = 0.7;

/**
 * Inter-reflected (indirect) illuminance, lux, from the integrating-sphere approximation:
 * E = Φ × ρ̄ ÷ [S × (1 − ρ̄)], S = total surface (floor + ceiling + walls), ρ̄ = mean reflectance.
 * Used only for the 3D ambient light; the lux readout comes from the lumen method.
 */
export function indirectLux(totalLumens, room) {
  if (totalLumens <= 0) return 0;
  const area = calculateRoomArea(room);
  const wallArea = calculateRoomPerimeter(room) * room.height;
  const floor = FLOOR_MATERIALS.find((f) => f.id === room.floorMaterialId) || FLOOR_MATERIALS[0];
  const rhoFloor = reflectanceFromHex(floor.color);
  const surface = 2 * area + wallArea;
  const rho = Math.min(
    0.85,
    (area * CEILING_REFLECTANCE + area * rhoFloor + wallArea * wallReflectance(room)) / surface
  );
  return (totalLumens * rho) / (surface * (1 - rho));
}

/** Approximate light reflectance of the selected wall paint (0–1). */
export function wallReflectance(room) {
  const wall = WALL_COLORS.find((w) => w.id === room.wallColorId) || WALL_COLORS[0];
  return reflectanceFromHex(wall.color);
}
