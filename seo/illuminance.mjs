/**
 * Simplified lumen method used by the static SEO pages
 * (seo/build-seo.mjs inlines these functions in the calculator). The 3D simulator
 * itself shows the simpler lumens ÷ area figure.
 *
 *   average lux ≈ lumens × UF × MF ÷ floor area
 *
 * UF (utilization factor) is the share of the light that reaches the floor/work plane,
 * which depends mostly on how much the walls reflect. MF (maintenance factor) accounts
 * for LEDs and fixtures losing output and getting dirty over time.
 * It is an estimate for planning, not a lighting design calculation.
 */

/** Utilization factor by wall tone (typical small residential rooms). */
export const WALL_TONE_UF = { light: 0.6, medium: 0.5, dark: 0.4 };

/** Light output kept over time (LED depreciation + dust). */
export const MAINTENANCE_FACTOR = 0.8;

/** Typical residential LED efficacy, lumens per watt (real bulbs range ~80–110 lm/W). */
export const LED_LM_PER_W = 95;

/** Wall paint ids used by the simulator → tone. */
export const WALL_TONE_BY_COLOR = {
  off_white: 'light',
  sand: 'light',
  sage: 'medium',
  terracotta: 'medium',
  navy_slate: 'dark',
  charcoal: 'dark',
};

/** Fraction of the emitted lumens that ends up as useful light on the floor. */
export function lightLossFactor(wallTone = 'light', ceilingHeight = 2.7) {
  const uf = WALL_TONE_UF[wallTone] ?? WALL_TONE_UF.medium;
  const tallCeiling = ceilingHeight > 3 ? 0.9 : 1; // light travels further, less reaches the floor
  return uf * tallCeiling * MAINTENANCE_FACTOR;
}

/** Estimated average illuminance (lux) for a room. */
export function estimateLux(lumens, area, wallTone, ceilingHeight) {
  if (!area || area <= 0) return 0;
  return (lumens * lightLossFactor(wallTone, ceilingHeight)) / area;
}

/** Lumens needed to reach a target average illuminance (lux). */
export function lumensNeeded(lux, area, wallTone, ceilingHeight) {
  return (lux * area) / lightLossFactor(wallTone, ceilingHeight);
}
