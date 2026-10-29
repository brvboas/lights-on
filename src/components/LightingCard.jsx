import React from 'react';
import { Info, Wand2, Plus } from 'lucide-react';
import { ROOM_LUX } from '../utils/illuminance';
import { ROOM_TYPES } from '../utils/lightingPhysics';

const LOCALE = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

/** Fills {name} placeholders of an i18n string. */
export const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

/** Where the lux sits on the bar: 0 … 1.5 × the top of the recommended range. */
function gauge(lux, [min, max]) {
  const top = max * 1.5;
  const pct = (v) => Math.max(0, Math.min(100, (v / top) * 100));
  return { marker: pct(lux), zoneLeft: pct(min), zoneWidth: pct(max) - pct(min), top };
}

function Gauge({ lux, range, compact = false }) {
  const g = gauge(lux, range);
  return (
    <div className={`relative rounded-full bg-slate-800 ${compact ? 'h-1.5' : 'h-2.5'}`} aria-hidden="true">
      <div
        className="absolute inset-y-0 bg-emerald-400/35 border-x-2 border-emerald-400"
        style={{ left: `${g.zoneLeft}%`, width: `${g.zoneWidth}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-amber-400 border-[3px] border-slate-900 transition-[left] duration-300 ${
          compact ? 'w-3.5 h-3.5 border-2' : 'w-[18px] h-[18px]'
        }`}
        style={{ left: `${g.marker}%` }}
      />
    </div>
  );
}

/**
 * Lighting summary: lux, room use, where it sits in the recommended range, the mood of the
 * light and one action ("Adjust to recommended" / "Add N lights" / …).
 *  - variant "full": desktop sidebar and the collapsed phone sheet
 *  - variant "compact": one line, shown on phones while the sheet is open
 */
export default function LightingCard({
  t,
  lang,
  lux,
  roomType,
  onRoomType,
  mood,
  assessment,
  plan,
  onAdjust,
  onAddLights,
  onMethod,
  variant = 'full',
  className = '',
}) {
  const range = ROOM_LUX[roomType].lux;
  const nf = (n) => new Intl.NumberFormat(LOCALE[lang]).format(Math.round(n));
  const roomName = t.roomTypes[roomType];

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2.5 px-3 py-2 mx-2 mt-1 rounded-xl bg-slate-950/70 border border-slate-800 ${className}`}
        title={`${mood.label} • ${assessment.label} (${assessment.range})`}
      >
        <span className="text-base font-extrabold text-white whitespace-nowrap">
          {lux} <span className="text-[11px] font-semibold text-slate-300">lux</span>
        </span>
        <div className="flex-1 min-w-0">
          <Gauge lux={lux} range={range} compact />
        </div>
        <span className={`text-[11px] font-semibold whitespace-nowrap ${assessment.color}`}>
          {assessment.icon} {roomName}
        </span>
      </div>
    );
  }

  let message = null;
  let action = null;
  const btn =
    'w-full min-h-10 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-amber-500/55 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[13px] font-semibold transition-colors cursor-pointer';

  if (plan.status === 'noLamps') {
    message = <span className="text-slate-300">{t.noLampsMsg}</span>;
    action = (
      <button type="button" className={btn} onClick={() => onAddLights(1)}>
        <Plus className="w-4 h-4" /> {t.addLight}
      </button>
    );
  } else if (plan.status === 'adjust' || plan.status === 'tooBright') {
    const sign = plan.deltaLm >= 0 ? '+' : '−';
    if (plan.status === 'tooBright') {
      message = (
        <span className="text-sky-200">{fill(t.tooBrightMsg, { lux: nf(plan.resultLux) })}</span>
      );
    }
    action = (
      <button type="button" className={btn} onClick={onAdjust}>
        <Wand2 className="w-4 h-4" />
        <span>
          {plan.status === 'tooBright' ? t.dimToMin : t.adjustBtn}{' '}
          <span className="font-normal opacity-80">
            ({sign}
            {nf(Math.abs(plan.deltaLm))} lm)
          </span>
        </span>
      </button>
    );
  } else if (plan.status === 'needMore') {
    message = (
      <span className="text-amber-100/90">
        {fill(plan.n === 1 ? t.needMoreMsg1 : t.needMoreMsg, {
          n: plan.n,
          max: nf(plan.maxLux),
          missing: nf(Math.ceil(plan.missingLm / 100) * 100),
          min: range[0],
        })}
      </span>
    );
    action = (
      <button type="button" className={btn} onClick={() => onAddLights(plan.addCount)}>
        <Plus className="w-4 h-4" />
        {fill(plan.addCount === 1 ? t.addLightsBtn1 : t.addLightsBtn, { k: plan.addCount })}
      </button>
    );
  }

  return (
    <section
      aria-label={t.lightingTitle}
      className={`px-4 pt-3 pb-3.5 space-y-2.5 max-lg:px-3 max-lg:pt-1.5 max-lg:pb-2.5 max-lg:space-y-2 ${className}`}
    >
      <div className="flex items-center justify-between max-lg:hidden">
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400">
          {t.lightingTitle}
        </span>
        <button
          type="button"
          onClick={onMethod}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          {t.methodBtn}
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[44px] max-lg:text-3xl leading-none font-extrabold text-white tabular-nums">
            {lux}
          </span>
          <span className="text-base max-lg:text-sm font-semibold text-slate-300">lux</span>
        </div>
        <div className="flex items-end gap-1.5 min-w-0">
          <div className="flex flex-col items-end gap-1 min-w-0">
            <label htmlFor={`room-use-${variant}`} className="text-[11px] text-slate-400 max-lg:sr-only">
              {t.roomUse}
            </label>
            <select
              id={`room-use-${variant}`}
              value={roomType}
              onChange={(e) => onRoomType(e.target.value)}
              className="h-9 w-full max-w-[13rem] max-lg:max-w-[calc(100vw-9.5rem)] pl-2.5 pr-7 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-[13px] font-semibold truncate cursor-pointer"
            >
              {ROOM_TYPES.map((id) => (
                <option key={id} value={id}>
                  {t.roomTypes[id]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onMethod}
            aria-label={t.methodBtn}
            title={t.methodBtn}
            className="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-700 text-slate-400 hover:text-amber-300 cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <Gauge lux={lux} range={range} />
        <div className="relative h-3.5 text-[10px] text-slate-400" aria-hidden="true">
          <span className="absolute left-0">0</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${gauge(lux, range).zoneLeft}%` }}>
            {range[0]}
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${gauge(lux, range).zoneLeft + gauge(lux, range).zoneWidth}%` }}
          >
            {range[1]}
          </span>
          <span className="absolute right-0">{nf(range[1] * 1.5)} lx</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[13px] max-lg:text-xs">
        <span className={`font-semibold ${assessment.color}`}>
          {assessment.icon} {assessment.label}
        </span>
        <span
          className={`shrink-0 px-2.5 py-0.5 rounded-full border border-white/10 text-[11px] font-semibold ${mood.bg} ${mood.color}`}
        >
          {mood.short}
        </span>
      </div>

      {message && <p className="text-xs leading-snug">{message}</p>}
      {action}
    </section>
  );
}
