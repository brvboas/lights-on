/**
 * "Adjust to recommended": works out new lumens for the lamps so the room reaches the
 * middle of its recommended lux range (lumen method, see illuminance.js), and where to put
 * extra ceiling lights when the existing ones cannot get there even at full power.
 */
import { lightLossFactor } from './illuminance';
import { lumensToWatts } from './lightingPhysics';

/** Range of the per-lamp lumens slider. */
export const LAMP_MIN_LM = 200;
export const LAMP_MAX_LM = 4500;

/** At most this many lights are added in one click. */
export const MAX_ADDED_LAMPS = 12;

const round50 = (v) => Math.round(v / 50) * 50;
const clampLm = (v) => Math.min(LAMP_MAX_LM, Math.max(LAMP_MIN_LM, round50(v)));
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** Scales every lamp by the same factor (each clamped to the slider range) to reach `goal` lm. */
function scaleLumens(list, goal) {
  let lo = 0;
  let hi = 1;
  while (sum(list.map((l) => clampLm(l * hi))) < goal && hi < 1e4) hi *= 2;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (sum(list.map((l) => clampLm(l * mid))) < goal) lo = mid;
    else hi = mid;
  }
  return list.map((l) => clampLm(l * hi));
}

/**
 * Plan for the lighting card. `range` = [min, max] lux of the room use.
 * status:
 *  - 'noLamps'   no light in the room
 *  - 'inRange'   lit lamps already inside the range (nothing to do)
 *  - 'adjust'    scaling the lamps reaches the range (`changes`, `deltaLm`, `resultLux`)
 *  - 'needMore'  even at full power it stays below the minimum (`maxLux`; `missingLm` and
 *                `addCount` = lumens and full-power lights missing to reach the minimum)
 *  - 'tooBright' even at minimum it stays above the maximum (`changes` = all at minimum, `resultLux`)
 */
export function planLightAdjustment(lamps, geometry, wallRho, range) {
  if (!lamps.length || !geometry.area) return { status: 'noLamps' };
  const [min, max] = range;
  const luxPerLm = lightLossFactor(geometry, wallRho) / geometry.area;
  const on = lamps.filter((l) => l.isOn);
  const pool = on.length ? on : lamps; // all off: switch them on and adjust
  const currentLm = sum(on.map((l) => l.lumens));
  const currentLux = currentLm * luxPerLm;

  if (on.length && currentLux >= min && currentLux <= max) {
    return { status: 'inRange', currentLux };
  }

  const n = pool.length;
  const needed = ((min + max) / 2) / luxPerLm;
  const maxLm = n * LAMP_MAX_LM;
  const minLm = n * LAMP_MIN_LM;
  const maxLux = maxLm * luxPerLm;
  const minLux = minLm * luxPerLm;

  if (maxLux < min) {
    // Aim at the bottom of the range: fewest new lights; the next plan then scales them all
    const missingLm = min / luxPerLm - maxLm;
    return {
      status: 'needMore',
      n,
      maxLux,
      missingLm,
      addCount: Math.min(MAX_ADDED_LAMPS, Math.max(1, Math.ceil(missingLm / LAMP_MAX_LM))),
    };
  }

  const goal = Math.min(maxLm, Math.max(minLm, needed));
  const newLm = scaleLumens(pool.map((l) => l.lumens), goal);
  const changes = {};
  pool.forEach((l, i) => {
    changes[l.id] = { lumens: newLm[i], watts: lumensToWatts(newLm[i]), isOn: true };
  });
  const resultLm = sum(newLm);
  return {
    status: minLux > max ? 'tooBright' : 'adjust',
    n,
    changes,
    deltaLm: resultLm - currentLm,
    resultLux: resultLm * luxPerLm,
  };
}

/** Is (x, z) inside the floor plan, `m` meters away from the walls? (same outlines as RoomMesh) */
function insideRoom(room, x, z, m) {
  const hw = room.width / 2 - m;
  const hd = room.depth / 2 - m;
  if (Math.abs(x) > hw || Math.abs(z) > hd) return false;
  if (room.shape === 'l-shape' && x > -m && z > -m) return false; // missing quadrant
  if (room.shape === 'octagonal') {
    const cx = room.width * 0.25;
    const cz = room.depth * 0.25;
    const ox = Math.abs(x) + m - (room.width / 2 - cx);
    const oz = Math.abs(z) + m - (room.depth / 2 - cz);
    if (ox > 0 && oz > 0 && ox / cx + oz / cz > 1) return false; // cut corner
  }
  return true;
}

/**
 * Positions for `count` new ceiling lights: grid points inside the room, picked one by one
 * as far as possible from the lights already there and about half a spacing from the walls.
 */
export function placeNewLamps(room, lamps, count) {
  const margin = 0.5;
  const steps = 12;
  const candidates = [];
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const x = -room.width / 2 + margin + ((room.width - 2 * margin) * i) / steps;
      const z = -room.depth / 2 + margin + ((room.depth - 2 * margin) * j) / steps;
      if (insideRoom(room, x, z, margin)) candidates.push({ x, z });
    }
  }
  const taken = lamps.map((l) => ({ x: l.x, z: l.z }));
  const out = [];
  for (let k = 0; k < count && candidates.length; k++) {
    let best = null;
    let bestScore = -Infinity;
    for (const c of candidates) {
      const toLamps = taken.length
        ? Math.min(...taken.map((p) => Math.hypot(p.x - c.x, p.z - c.z)))
        : Infinity;
      const toWall = Math.min(room.width / 2 - Math.abs(c.x), room.depth / 2 - Math.abs(c.z));
      const score = Math.min(toLamps, 2 * toWall);
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    const p = { x: Number(best.x.toFixed(2)), z: Number(best.z.toFixed(2)) };
    out.push(p);
    taken.push(p);
  }
  return out;
}
