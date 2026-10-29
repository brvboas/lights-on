import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, RotateCw, Scissors, Trash2, ChevronDown, Lightbulb, FileBox } from 'lucide-react';
import { MODEL_ACCEPT, MODEL_UNITS } from '../utils/modelImport';

const HEAVY_MODEL_TRIANGLES = 600000;

/**
 * "Import project" panel, opened from the top bar. It floats over the 3D view without
 * covering it, so the model can be seen while the unit, axis, cut and floor are adjusted.
 */
export default function ImportPanel({
  open,
  onClose,
  t,
  model,
  loading,
  error,
  onFiles,
  onUpdate,
  onRemove,
  projectLamps,
}) {
  const inputRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [dropActive, setDropActive] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const pick = () => inputRef.current?.click();
  const lights = model?.lights || [];

  return (
    <div
      role="dialog"
      aria-labelledby="import-title"
      className="absolute z-40 top-20 right-4 w-[22rem] max-h-[calc(100%-10rem)] max-sm:max-h-[calc(100%-9rem)] max-sm:top-16 max-sm:left-2.5 max-sm:right-2.5 max-sm:w-auto flex flex-col rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-800 shrink-0">
        <div>
          <h2 id="import-title" className="text-sm font-bold text-white flex items-center gap-2">
            <FileBox className="w-4 h-4 text-amber-400" />
            {t.importTitle}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">GLB · glTF · OBJ · FBX · DAE</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.importClose}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={MODEL_ACCEPT}
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {!model ? (
          <button
            type="button"
            onClick={pick}
            onDragOver={(e) => {
              e.preventDefault();
              setDropActive(true);
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropActive(false);
              onFiles(e.dataTransfer.files);
            }}
            disabled={loading}
            className={`w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border border-dashed text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
              dropActive
                ? 'border-amber-300 bg-amber-500/25 text-amber-100'
                : 'border-amber-400/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
            }`}
          >
            <Upload className="w-5 h-5" />
            {loading ? t.importLoading : t.importButton}
            {!loading && <span className="text-[10px] font-normal text-amber-200/70">{t.importDropHint}</span>}
          </button>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate" title={model.name}>
                  {model.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {model.size.x} × {model.size.z} m · {t.modelTall} {model.size.y} m
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={pick}
                  disabled={loading}
                  title={t.modelReplace}
                  aria-label={t.modelReplace}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  title={t.modelRemove}
                  aria-label={t.modelRemove}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-200 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loading && <p className="text-[11px] text-amber-200">{t.importLoading}</p>}
            {model.triangles > HEAVY_MODEL_TRIANGLES && (
              <p className="text-[11px] text-amber-200/90 leading-snug">
                {t.importHeavy.replace('{n}', Math.round(model.triangles / 1000))}
              </p>
            )}

            {/* Lights that came in the file: already turned into lamps on import */}
            {lights.length > 0 && projectLamps > 0 ? (
              <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-[12px] leading-snug text-amber-100 flex gap-2">
                <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                {t.importLightsDone.replace('{n}', projectLamps)}
              </p>
            ) : lights.length === 0 ? (
              <p className="text-[11px] text-slate-500 leading-snug">{t.importNoLights}</p>
            ) : null}

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 leading-tight">
                  {t.modelUnit}
                  <span className="block text-[10px] text-slate-500">{t.modelUnitAuto}</span>
                </span>
                <select
                  value={model.setup.unit}
                  onChange={(e) => onUpdate({ unit: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs cursor-pointer"
                >
                  {MODEL_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {t.units[u.id]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate({ zUp: !model.setup.zUp })}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {t.modelAxis}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ cut: !model.setup.cut })}
                  aria-pressed={model.setup.cut}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                    model.setup.cut
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  {t.modelCut}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t.modelFloor}</span>
                  <span className="font-semibold text-white">{model.setup.floorLevel} m</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0.5, Math.min(60, Math.floor(model.size.y * 20) / 20))}
                  step={0.05}
                  value={model.setup.floorLevel}
                  onChange={(e) => onUpdate({ floorLevel: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 leading-snug">{t.modelFloorHint}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-snug">{t.importModelNotes}</p>
          </>
        )}

        {error && (
          <p className="text-[11px] text-rose-300 leading-snug">
            {error === 'unsupported' ? t.importErrUnsupported : t.importErrFailed}
          </p>
        )}
        {!model && <p className="text-[11px] text-slate-400 leading-snug">{t.importDesc}</p>}

        <div className="rounded-xl border border-dashed border-slate-700">
          <button
            type="button"
            onClick={() => setGuideOpen((o) => !o)}
            aria-expanded={guideOpen}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[12px] font-semibold text-slate-300 cursor-pointer"
          >
            {t.guideTitle}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
          </button>
          {guideOpen && (
            <ul className="px-3 pb-3 space-y-1.5">
              {t.guide.map(([app, how]) => (
                <li key={app} className="text-[11px] leading-snug text-slate-400">
                  <span className="font-semibold text-slate-200">{app}:</span> {how}
                </li>
              ))}
              <li className="text-[11px] leading-snug text-slate-500 pt-1">{t.importMtlTip}</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
