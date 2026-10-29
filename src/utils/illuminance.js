/**
 * Lumen method (método dos lúmens) — shared by the 3D simulator and the static SEO pages.
 * Keep this file free of imports: seo/build-seo.mjs inlines it into the page calculator.
 *
 *   E (lux) = Φ × CU × FM ÷ A
 *
 *   Φ   total luminous flux of the lamps (lm)
 *   CU  utilization factor: share of the flux that reaches the work plane. It depends on the
 *       room index K and on how much the walls reflect.
 *   FM  maintenance factor: LED lumen depreciation + dirt over time.
 *   A   floor area (m²)
 *
 *   K = 2·A ÷ (h × P)      (for a rectangle: K = C·L ÷ [h × (C + L)])
 *   h = ceiling height − work plane height (0.75 m, a table top)
 *   P = room perimeter
 *
 * Method: IES Lighting Handbook (lumen / zonal cavity method) and CIE 52 (utilization factors).
 * Target illuminances: ANSI/IES RP-11 (residential) and ABNT NBR ISO/CIE 8995-1, plus the
 * residential values of the former NBR 5413 (see ROOM_LUX).
 *
 * The CU table below holds representative values for a general-diffusing ceiling luminaire
 * (ceiling reflectance 0.7, floor 0.2), the usual case for home plafons and pendants. A real
 * project uses the table from the luminaire's photometric file; this is an estimate for
 * planning, not a lighting design calculation.
 */

/** Height of the work plane where illuminance is measured (m). */
export const WORK_PLANE_HEIGHT = 0.75;

/** Light output kept over time (LED depreciation + dust), typical for clean homes. */
export const MAINTENANCE_FACTOR = 0.8;

/** Typical residential LED efficacy, lumens per watt (real bulbs range ~80–110 lm/W). */
export const LED_LM_PER_W = 95;

/** Wall reflectance used for each wall tone in the SEO calculator. */
export const WALL_TONE_REFLECTANCE = { light: 0.5, medium: 0.3, dark: 0.1 };

/** Room index columns of the CU table. */
export const UF_K = [0.6, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5];

/** Utilization factor by wall reflectance (rows) and room index (columns, see UF_K). */
export const UF_TABLE = [
  { wall: 0.5, uf: [0.33, 0.40, 0.45, 0.50, 0.53, 0.58, 0.61, 0.64, 0.67, 0.69] },
  { wall: 0.3, uf: [0.27, 0.34, 0.39, 0.44, 0.48, 0.53, 0.57, 0.60, 0.64, 0.66] },
  { wall: 0.1, uf: [0.23, 0.29, 0.34, 0.39, 0.43, 0.49, 0.53, 0.56, 0.61, 0.63] },
];

/**
 * Recommended general (ambient) illuminance per room type, lux, plus the task range
 * (desk, counter, mirror…). Comfort references for homes, not legal limits.
 */
export const ROOM_LUX = {
  living: { lux: [100, 200], target: 150, task: [300, 500] },
  bedroom: { lux: [100, 150], target: 120, task: [300, 500] },
  kitchen: { lux: [200, 300], target: 250, task: [300, 500] },
  bathroom: { lux: [150, 250], target: 200, task: [300, 500] },
  office: { lux: [300, 500], target: 300, task: [500, 500] },
  dining: { lux: [100, 200], target: 150, task: [200, 300] },
  hallway: { lux: [75, 150], target: 100, task: [100, 150] },
  laundry: { lux: [200, 300], target: 250, task: [300, 500] },
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Approximate light reflectance (LRV, 0–1) of a paint color: its relative luminance. */
export function reflectanceFromHex(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

/** Room geometry for a W × D rectangle. */
export function rectGeometry(width, depth, height) {
  return { area: width * depth, perimeter: 2 * (width + depth), height };
}

/** Geometry when only the area is known: assumes a 4:3 rectangle. */
export function geometryFromArea(area, height) {
  const width = Math.sqrt((area * 4) / 3);
  return rectGeometry(width, area / width, height);
}

/** Room index K = 2A ÷ (h·P), h measured from the work plane to the ceiling. */
export function roomIndex({ area, perimeter, height }) {
  const h = Math.max(0.5, height - WORK_PLANE_HEIGHT);
  return (2 * area) / (h * perimeter);
}

/** Utilization factor for a room index and wall reflectance (bilinear interpolation). */
export function utilizationFactor(k, wallReflectance = 0.5) {
  const kk = clamp(k, UF_K[0], UF_K[UF_K.length - 1]);
  let i = 0;
  while (i < UF_K.length - 2 && kk > UF_K[i + 1]) i++;
  const tk = (kk - UF_K[i]) / (UF_K[i + 1] - UF_K[i]);
  const row = (r) => r.uf[i] + (r.uf[i + 1] - r.uf[i]) * tk;
  const rho = clamp(wallReflectance, 0.1, 0.5);
  let j = 0;
  while (j < UF_TABLE.length - 2 && rho < UF_TABLE[j + 1].wall) j++;
  const a = UF_TABLE[j];
  const b = UF_TABLE[j + 1];
  const tw = (a.wall - rho) / (a.wall - b.wall);
  return row(a) + (row(b) - row(a)) * tw;
}

/** CU × FM: share of the lamp lumens that ends up as useful light on the work plane. */
export function lightLossFactor(geometry, wallReflectance) {
  return utilizationFactor(roomIndex(geometry), wallReflectance) * MAINTENANCE_FACTOR;
}

/** Estimated average illuminance (lux) on the work plane. */
export function estimateLux(lumens, geometry, wallReflectance) {
  if (!geometry.area || geometry.area <= 0) return 0;
  return (lumens * lightLossFactor(geometry, wallReflectance)) / geometry.area;
}

/** Lumens needed to reach a target average illuminance (lux). */
export function lumensNeeded(lux, geometry, wallReflectance) {
  return (lux * geometry.area) / lightLossFactor(geometry, wallReflectance);
}

/** Floor area (m², 4:3 room) that a given flux keeps at the target lux. */
export function areaLitBy(lumens, lux, height, wallReflectance) {
  let area = lumens / lux;
  for (let n = 0; n < 30; n++) {
    area = (lumens * lightLossFactor(geometryFromArea(area, height), wallReflectance)) / lux;
  }
  return area;
}
