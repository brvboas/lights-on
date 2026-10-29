import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Lightbulb,
  LightbulbOff,
  Maximize2,
  Sofa,
  Camera,
  Plus,
  Trash2,
  Copy,
  RotateCw,
  Grid as GridIcon,
  Sparkles,
  Sun,
  Moon,
  Download,
  X,
  Move,
  Crosshair,
  Globe,
  ChevronDown,
  Info,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import Scene3D from './components/Scene3D';
import AuthorCredit from './components/AuthorCredit';
import MethodologyModal from './components/MethodologyModal';
import LightingCard, { fill } from './components/LightingCard';
import {
  kelvinToHex,
  WATT_PRESETS,
  wattsToLumens,
  lumensToWatts,
  FLOOR_MATERIALS,
  WALL_COLORS,
  FURNITURE_CATALOG,
  SCENE_PRESETS,
  calculateRoomArea,
  roomGeometry,
  wallReflectance,
} from './utils/lightingPhysics';
import { estimateLux, roomIndex, utilizationFactor, ROOM_LUX } from './utils/illuminance';
import { TRANSLATIONS } from './utils/i18n';
import {
  planLightAdjustment,
  placeNewLamps,
  LAMP_MIN_LM,
  LAMP_MAX_LM,
} from './utils/lightAdjust';
import { HUB_SLUG } from '../seo/routes.mjs';

const LANGS = ['pt', 'en', 'es'];
const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };

/**
 * Starting language: the URL (/pt/, /en/, /es/ — the server already sends "/" to the
 * visitor's language by country), then the visitor's last choice, then the browser language.
 */
function initialLang() {
  if (typeof window === 'undefined') return 'pt';
  const fromPath = window.location.pathname.split('/')[1];
  if (LANGS.includes(fromPath)) return fromPath;
  const saved = document.cookie.match(/(?:^|; )lang=(pt|en|es)/)?.[1];
  if (saved) return saved;
  for (const l of navigator.languages || [navigator.language]) {
    const code = String(l).slice(0, 2).toLowerCase();
    if (LANGS.includes(code)) return code;
  }
  return 'en';
}

export default function App() {
  const [lang, setLang] = useState(initialLang); // 'pt' | 'en' | 'es'
  const t = TRANSLATIONS[lang];

  // Keep <html lang>, title, description and the language URL (/pt/, /en/, /es/) in sync
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    document.title = t.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription);
    const { pathname, search, hash } = window.location;
    const first = pathname.split('/')[1];
    if (first !== lang && (pathname === '/' || LANGS.includes(first))) {
      window.history.replaceState(null, '', `/${lang}/${search}${hash}`);
    }
  }, [lang, t]);

  // Language picked by hand: remember it, so "/" opens in that language next time
  const chooseLang = (code) => {
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
    setLang(code);
  };

  const [room, setRoom] = useState(SCENE_PRESETS.living_room.room);
  const [lamps, setLamps] = useState(SCENE_PRESETS.living_room.lamps);
  const [furniture, setFurniture] = useState(SCENE_PRESETS.living_room.furniture);

  const [activeTab, setActiveTab] = useState('lamps'); // 'lamps' | 'room' | 'furniture'
  const [selectedId, setSelectedId] = useState('lamp-1');
  const [selectedType, setSelectedType] = useState('lamp'); // 'lamp' | 'furniture' | null

  const [showGrid, setShowGrid] = useState(true);
  const [ambientLevel, setAmbientLevel] = useState(0.18);
  const [cameraView, setCameraView] = useState('perspective');
  const [hideUIForPhoto, setHideUIForPhoto] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showFurnitureMenu, setShowFurnitureMenu] = useState(false);
  // Mobile/tablet only (< lg): the sidebar becomes a bottom sheet that can be collapsed
  const [sheetOpen, setSheetOpen] = useState(false);
  const asideRef = useRef(null);
  const dragZoneRef = useRef(null);
  const sheetDrag = useRef(null); // live drag info, kept out of React state to avoid re-renders
  const suppressClick = useRef(false);

  const canvasRef = useRef(null);
  const [showMethod, setShowMethod] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false); // top-right "⋯" menu
  const moreRef = useRef(null);
  const [advOpen, setAdvOpen] = useState(false); // lamp tab: advanced settings
  const [finishesOpen, setFinishesOpen] = useState(false); // room tab: wall/floor
  const [toast, setToast] = useState(null); // { message, lamps (snapshot to undo), id }
  const [showHints, setShowHints] = useState(() => {
    try {
      return localStorage.getItem('lumina-hints') !== 'off';
    } catch {
      return true;
    }
  });

  // Dynamically localize lamp and furniture names whenever language changes
  const localizedLamps = useMemo(() => {
    const typeLabels = {
      pendant: t.typePendant,
      plafon: t.typePlafon,
      spot: t.typeSpot,
      floor_lamp: t.typeFloor,
    };
    return lamps.map((l, idx) => {
      if (l.customName !== undefined) {
        return { ...l, name: l.customName };
      }
      const baseName =
        l.nameKey && t.presetLampNames?.[l.nameKey]
          ? t.presetLampNames[l.nameKey]
          : `${typeLabels[l.type] || t.typePendant} ${l.indexNum || idx + 1}`;
      const displayName = l.isCopy ? `${baseName} (${t.copySuffix})` : baseName;
      return { ...l, name: displayName };
    });
  }, [lamps, t]);

  const localizedFurniture = useMemo(
    () =>
      furniture.map((f) => {
        const baseName = t.furnitureNames[f.type] || f.name;
        const displayName = f.isCopy ? `${baseName} (${t.copySuffix})` : baseName;
        return { ...f, name: displayName };
      }),
    [furniture, t]
  );

  // Currently selected lamp or furniture item
  const selectedLamp = useMemo(
    () => localizedLamps.find((l) => l.id === selectedId) || localizedLamps[0] || null,
    [localizedLamps, selectedId]
  );

  const selectedFurniture = useMemo(
    () =>
      localizedFurniture.find((f) => f.id === selectedId) ||
      localizedFurniture[0] ||
      null,
    [localizedFurniture, selectedId]
  );

  // Real-time photometric telemetry calculations
  const roomArea = useMemo(() => calculateRoomArea(room), [room]);
  const totalLumens = useMemo(
    () => lamps.reduce((acc, l) => acc + (l.isOn ? l.lumens : 0), 0),
    [lamps]
  );
  const totalWatts = useMemo(
    () => Number(lamps.reduce((acc, l) => acc + (l.isOn ? l.watts : 0), 0).toFixed(1)),
    [lamps]
  );
  // Lumen method: lux = lumens × CU × MF ÷ area (see utils/illuminance.js)
  const photometry = useMemo(() => {
    const geometry = roomGeometry(room);
    const rho = wallReflectance(room);
    const k = roomIndex(geometry);
    return { geometry, rho, k, cu: utilizationFactor(k, rho) };
  }, [room]);
  const averageLux = useMemo(
    () => Math.round(estimateLux(totalLumens, photometry.geometry, photometry.rho)),
    [totalLumens, photometry]
  );

  const roomType = ROOM_LUX[room.roomType] ? room.roomType : 'living';
  const luxTarget = ROOM_LUX[roomType];

  // Mood: what kind of light the room has, whatever its use
  const luxMood = useMemo(() => {
    if (averageLux <= 0) {
      return { label: t.luxDark, color: 'text-slate-400', bg: 'bg-slate-800/80' };
    }
    if (averageLux < 50) {
      return { label: t.luxDim, color: 'text-amber-300', bg: 'bg-amber-950/70' };
    }
    if (averageLux < 150) {
      return { label: t.luxCozy, color: 'text-emerald-300', bg: 'bg-emerald-950/70' };
    }
    if (averageLux < 300) {
      return { label: t.luxIdeal, color: 'text-sky-300', bg: 'bg-sky-950/70' };
    }
    return { label: t.luxIntense, color: 'text-purple-300', bg: 'bg-purple-950/70' };
  }, [averageLux, t]);
  const luxMoodShort = { ...luxMood, short: luxMood.label.replace(/\s*\(.*\)$/, '') };

  // Plan for the "Adjust to recommended" / "Add N lights" action of the lighting card
  const plan = useMemo(
    () => planLightAdjustment(lamps, photometry.geometry, photometry.rho, luxTarget.lux),
    [lamps, photometry, luxTarget]
  );

  // Assessment: how the lux compares with the recommendation for the chosen room use
  const luxAssessment = useMemo(() => {
    const [min, max] = luxTarget.lux;
    const range = `${t.roomTypes[roomType]}: ${min}–${max} lx`;
    if (averageLux < min * 0.7) {
      return { label: t.luxLow, short: t.luxLowShort, min, max, range, color: 'text-amber-200', icon: '▼' };
    }
    if (averageLux < min) {
      return { label: t.luxSlightlyLow, short: t.luxSlightlyLowShort, min, max, range, color: 'text-yellow-200', icon: '▼' };
    }
    if (averageLux <= max) {
      return { label: t.luxGood, short: t.luxGoodShort, min, max, range, color: 'text-emerald-200', icon: '✓' };
    }
    return { label: t.luxHigh, short: t.luxHighShort, min, max, range, color: 'text-sky-200', icon: '▲' };
  }, [averageLux, luxTarget, roomType, t]);

  // Tabs: on mobile, tapping a tab opens the sheet; tapping the active tab again collapses it
  const handleTabClick = (tab) => {
    if (tab === activeTab) {
      setSheetOpen((o) => !o);
    } else {
      setActiveTab(tab);
      setSheetOpen(true);
    }
  };

  // Swipe the bottom sheet up/down (only below lg; desktop never enters this path)
  const isSheetLayout = () => window.matchMedia('(max-width: 1023.98px)').matches;
  const sheetHeights = () => {
    const aside = asideRef.current;
    const cs = getComputedStyle(aside);
    const collapsed =
      dragZoneRef.current.offsetHeight + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth);
    const open = Math.min(window.innerHeight * 0.58, 560);
    return { collapsed, open };
  };

  const handleSheetPointerDown = (e) => {
    if (!isSheetLayout() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    sheetDrag.current = {
      id: e.pointerId,
      startY: e.clientY,
      startH: asideRef.current.offsetHeight,
      startT: e.timeStamp,
      moved: false,
    };
  };

  const handleSheetPointerMove = (e) => {
    const d = sheetDrag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = d.startY - e.clientY; // > 0 = finger going up
    if (!d.moved) {
      if (Math.abs(dy) < 6) return;
      d.moved = true;
      d.heights = sheetHeights();
      e.currentTarget.setPointerCapture(e.pointerId);
      asideRef.current.style.transition = 'none';
      setSheetOpen(true); // render the content so it shows while the sheet grows
    }
    const { collapsed, open } = d.heights;
    const h = Math.min(open + 24, Math.max(collapsed, d.startH + dy));
    asideRef.current.style.height = `${h}px`;
  };

  const handleSheetPointerUp = (e) => {
    const d = sheetDrag.current;
    if (!d || d.id !== e.pointerId) return;
    sheetDrag.current = null;
    if (!d.moved) return; // a plain tap: let the click open/close normally
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false; // in case the browser fired no click after the drag
    }, 0);
    const aside = asideRef.current;
    const { collapsed, open } = d.heights;
    const h = aside.offsetHeight;
    // A short, quick flick goes where the finger went; otherwise snap to the nearest side
    const dy = d.startY - e.clientY;
    const isFlick = e.type !== 'pointercancel' && e.timeStamp - d.startT < 250 && Math.abs(dy) > 24;
    const shouldOpen = isFlick ? dy > 0 : h > (collapsed + open) / 2;
    aside.style.transition = 'height 260ms cubic-bezier(0.22, 1, 0.36, 1)';
    aside.style.height = `${shouldOpen ? open : collapsed}px`;
    window.setTimeout(() => {
      aside.style.transition = '';
      aside.style.height = '';
      setSheetOpen(shouldOpen);
    }, 270);
  };

  // A drag ends with a click on the tab under the finger; swallow it
  const handleSheetClickCapture = (e) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Lamp state handlers
  const handleSelectLamp = (id) => {
    setSelectedId(id);
    setSelectedType('lamp');
    setActiveTab('lamps');
  };

  const handleUpdateLamp = (id, changes) => {
    setLamps((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...changes } : l))
    );
  };

  const handleToggleLampPower = (id) => {
    setLamps((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isOn: !l.isOn } : l))
    );
  };

  const handleAddLamp = (type = 'pendant') => {
    const newId = `lamp-${Date.now()}`;
    const offset = (lamps.length % 3) * 0.6 - 0.5;
    const newLamp = {
      id: newId,
      indexNum: lamps.length + 1,
      type,
      x: Number(offset.toFixed(2)),
      z: Number((offset * 0.7).toFixed(2)),
      isOn: true,
      kelvin: 3000,
      watts: 12,
      lumens: 1140,
      scale: 1.0,
      heightOffset: 0,
    };
    setLamps((prev) => [...prev, newLamp]);
    handleSelectLamp(newId);
  };

  const handleDuplicateLamp = (lamp) => {
    if (!lamp) return;
    const newId = `lamp-${Date.now()}`;
    const sourceLamp = lamps.find((l) => l.id === lamp.id) || lamp;
    const copy = {
      ...sourceLamp,
      id: newId,
      isCopy: true,
      customName:
        sourceLamp.customName !== undefined
          ? `${sourceLamp.customName} (${t.copySuffix})`
          : undefined,
      x: Math.min(room.width / 2 - 0.5, Number((lamp.x + 0.6).toFixed(2))),
      z: Math.min(room.depth / 2 - 0.5, Number((lamp.z + 0.4).toFixed(2))),
    };
    setLamps((prev) => [...prev, copy]);
    handleSelectLamp(newId);
  };

  const handleDeleteLamp = (id) => {
    if (lamps.length <= 1) return; // retain at least 1 lamp
    const remaining = lamps.filter((l) => l.id !== id);
    setLamps(remaining);
    if (selectedId === id && remaining.length > 0) {
      setSelectedId(remaining[0].id);
    }
  };

  const handleToggleAllLamps = () => {
    const anyOn = lamps.some((l) => l.isOn);
    setLamps((prev) => prev.map((l) => ({ ...l, isOn: !anyOn })));
  };

  // Furniture state handlers
  const handleSelectFurniture = (id) => {
    setSelectedId(id);
    setSelectedType('furniture');
    setActiveTab('furniture');
  };

  const handleUpdateFurniture = (id, changes) => {
    setFurniture((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
  };

  const handleAddFurniture = (catalogItem) => {
    const newId = `furn-${Date.now()}`;
    const newItem = {
      id: newId,
      type: catalogItem.type,
      name: t.furnitureNames[catalogItem.type] || catalogItem.name,
      x: 0,
      z: 0,
      rotation: 0,
      scale: 1,
      color: catalogItem.defaultColor,
    };
    setFurniture((prev) => [...prev, newItem]);
    handleSelectFurniture(newId);
    setShowFurnitureMenu(false);
  };

  const handleDuplicateFurniture = (item) => {
    if (!item) return;
    const newId = `furn-${Date.now()}`;
    const sourceItem = furniture.find((f) => f.id === item.id) || item;
    const copy = {
      ...sourceItem,
      id: newId,
      isCopy: true,
      x: Math.min(room.width / 2 - 0.6, Number((item.x + 0.6).toFixed(2))),
      z: Math.min(room.depth / 2 - 0.6, Number((item.z + 0.4).toFixed(2))),
    };
    setFurniture((prev) => [...prev, copy]);
    handleSelectFurniture(newId);
  };

  const handleDeleteFurniture = (id) => {
    const remaining = furniture.filter((f) => f.id !== id);
    setFurniture(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id || lamps[0]?.id || null);
      setSelectedType(remaining[0] ? 'furniture' : 'lamp');
    }
  };

  // Load architectural room preset
  const handleLoadPreset = (presetKey) => {
    const p = SCENE_PRESETS[presetKey];
    if (!p) return;
    setRoom(p.room);
    setLamps(p.lamps);
    setFurniture(p.furniture);
    setSelectedId(p.lamps[0]?.id || null);
    setSelectedType('lamp');
  };

  // Capture high-resolution WebGL snapshot
  const handleTakePhoto = () => {
    setHideUIForPhoto(true);
    setFlashEffect(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedPhoto({
          url: dataUrl,
          summary: `${room.width}m × ${room.depth}m (${roomArea}m²) • ${totalWatts}W LED • ${totalLumens} lm • ${averageLux} lux`,
        });
      }
      setHideUIForPhoto(false);
      setTimeout(() => setFlashEffect(false), 250);
    }, 120);
  };

  const handleDownloadPhoto = () => {
    if (!capturedPhoto) return;
    const link = document.createElement('a');
    link.download = `lumina-studio-${Date.now()}.png`;
    link.href = capturedPhoto.url;
    link.click();
  };

  const anyLampOn = lamps.some((l) => l.isOn);

  const cameraViews = [
    { id: 'perspective', label: t.cam3d },
    { id: 'top', label: t.camTop },
    { id: 'front', label: t.camFront },
  ];

  // Undo toast: shows for 10 s after an automatic change
  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 10000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Esc or a tap/click anywhere outside the action bar closes the "⋯" menu
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMoreOpen(false);
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [moreOpen]);

  const luxOf = (list) =>
    Math.round(
      estimateLux(
        list.reduce((acc, l) => acc + (l.isOn ? l.lumens : 0), 0),
        photometry.geometry,
        photometry.rho
      )
    );

  const applyLamps = (next, message) => {
    setToast({ message, lamps, id: Date.now() });
    setLamps(next);
  };

  // Scale the lamps to the middle of the recommended range (each within 200–4500 lm)
  const handleAdjustLights = () => {
    if (!plan.changes) return;
    const next = lamps.map((l) => (plan.changes[l.id] ? { ...l, ...plan.changes[l.id] } : l));
    applyLamps(next, fill(t.adjustedToast, { lux: luxOf(next) }));
  };

  // Add ceiling lights spread over the room, then scale everything to the range
  const handleAddLights = (count) => {
    // all lights off: the plan counted them, so switch them back on too
    const base = lamps.some((l) => l.isOn) ? lamps : lamps.map((l) => ({ ...l, isOn: true }));
    const positions = placeNewLamps(room, base, count);
    const ref = base.find((l) => l.id === selectedId) || base[0];
    const stamp = Date.now();
    const added = positions.map((p, i) => ({
      id: `lamp-${stamp}-${i}`,
      indexNum: base.length + i + 1,
      type: 'plafon',
      x: p.x,
      z: p.z,
      isOn: true,
      kelvin: ref?.kelvin || 3000,
      watts: lumensToWatts(LAMP_MAX_LM),
      lumens: LAMP_MAX_LM,
      scale: 1,
      heightOffset: 0,
    }));
    let next = [...base, ...added];
    const p2 = planLightAdjustment(next, photometry.geometry, photometry.rho, luxTarget.lux);
    if (p2.changes) next = next.map((l) => (p2.changes[l.id] ? { ...l, ...p2.changes[l.id] } : l));
    applyLamps(
      next,
      fill(added.length === 1 ? t.addedToast1 : t.addedToast, { k: added.length, lux: luxOf(next) })
    );
  };

  const handleUndo = () => {
    if (!toast) return;
    const prev = toast.lamps;
    setLamps(prev);
    if (!prev.some((l) => l.id === selectedId)) setSelectedId(prev[0]?.id || null);
    setToast(null);
  };

  const hideHints = () => {
    setShowHints(false);
    try {
      localStorage.setItem('lumina-hints', 'off');
    } catch {
      // private mode / blocked storage: just hide for this visit
    }
  };

  return (
    <div className="relative w-screen h-screen max-lg:h-dvh bg-slate-950 overflow-hidden select-none flex max-lg:flex-col">
      {/* 3D Interactive Viewport */}
      <div className="flex-1 h-full max-lg:h-auto min-h-0 relative">
        <Scene3D
          room={room}
          lamps={localizedLamps}
          furniture={localizedFurniture}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelectLamp={handleSelectLamp}
          onSelectFurniture={handleSelectFurniture}
          onSelectEmpty={() => setSelectedType(null)}
          onUpdateLamp={handleUpdateLamp}
          onToggleLampPower={handleToggleLampPower}
          onUpdateFurniture={handleUpdateFurniture}
          showGrid={showGrid}
          ambientLevel={ambientLevel}
          cameraView={cameraView}
          hideUIForPhoto={hideUIForPhoto}
          canvasRef={canvasRef}
        />

        {/* Camera Flash Overlay */}
        {flashEffect && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-pulse opacity-80" />
        )}

        {/* Top bar — brand on the left; lights, camera, photo and the "more" menu on the right */}
        <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3 pointer-events-none max-sm:top-2.5 max-sm:left-2.5 max-sm:right-2.5 max-sm:gap-2">
          <div className="flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 pl-2 pr-3.5 py-2 rounded-2xl shadow-2xl pointer-events-auto max-sm:p-0 max-sm:bg-transparent max-sm:border-0 max-sm:shadow-none max-sm:backdrop-blur-none">
            <div className="w-9 h-9 max-sm:w-10 max-sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
              <Lightbulb className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 className="max-sm:sr-only text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              LuminaStudio
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3D
              </span>
            </h1>
          </div>

          <div
            ref={moreRef}
            className="relative flex items-center gap-2 bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl pointer-events-auto max-sm:gap-1.5 max-sm:p-1 max-sm:rounded-xl"
          >
            <button
              onClick={handleToggleAllLamps}
              aria-label={anyLampOn ? t.lightsOn : t.lightsOff}
              className={`flex items-center gap-1.5 h-9 px-3 whitespace-nowrap max-sm:h-10 max-sm:w-10 max-sm:px-0 max-sm:justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                anyLampOn
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={t.toggleAllTitle}
            >
              {anyLampOn ? <Lightbulb className="w-4 h-4" /> : <LightbulbOff className="w-4 h-4" />}
              <span className="max-sm:hidden lg:max-xl:hidden">{anyLampOn ? t.lightsOn : t.lightsOff}</span>
            </button>

            {/* Camera: segmented on larger screens, native picker on phones */}
            <div className="hidden sm:flex items-center bg-slate-950/70 rounded-xl p-0.5 border border-slate-800">
              {cameraViews.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setCameraView(v.id)}
                  aria-pressed={cameraView === v.id}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    cameraView === v.id ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <label className="sm:hidden sr-only" htmlFor="camera-view">
              {t.cameraLabel}
            </label>
            <select
              id="camera-view"
              value={cameraView}
              onChange={(e) => setCameraView(e.target.value)}
              className="sm:hidden h-10 pl-2 pr-6 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-semibold"
            >
              {cameraViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleTakePhoto}
              title={t.takePhoto}
              aria-label={t.takePhoto}
              className="flex items-center gap-1.5 h-9 px-3.5 whitespace-nowrap max-sm:h-10 max-sm:w-10 max-sm:px-0 max-sm:justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span className="max-sm:hidden lg:max-xl:hidden">{t.takePhoto}</span>
            </button>

            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-label={t.moreOptions}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              title={t.moreOptions}
              className={`h-9 w-9 max-sm:h-10 max-sm:w-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                moreOpen
                  ? 'bg-slate-800 border-amber-400/70 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {moreOpen && (
              <>
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 z-10 w-72 max-w-[calc(100vw-1.25rem)] rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl space-y-1"
                >
                  <button
                    role="menuitemcheckbox"
                    aria-checked={showGrid}
                    onClick={() => setShowGrid((g) => !g)}
                    className="w-full h-11 flex items-center justify-between px-3 rounded-xl hover:bg-slate-800 text-[13px] text-slate-100 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <GridIcon className="w-4 h-4 text-sky-400" /> {t.gridLabel}
                    </span>
                    <span className={`relative w-9 h-5 rounded-full transition-colors ${showGrid ? 'bg-sky-500' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-slate-950 transition-all ${showGrid ? 'left-[18px]' : 'left-0.5'}`} />
                    </span>
                  </button>

                  <div className="flex items-center justify-between h-11 px-3 text-[13px] text-slate-100">
                    <span className="flex items-center gap-2">
                      {ambientLevel < 0.1 ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-300" />}
                      {t.ambientLabel}
                    </span>
                    <div className="flex rounded-lg border border-slate-700 p-0.5">
                      {[
                        { id: 'day', label: t.day, level: 0.22, active: ambientLevel >= 0.1 },
                        { id: 'night', label: t.night, level: 0.03, active: ambientLevel < 0.1 },
                      ].map((o) => (
                        <button
                          key={o.id}
                          role="menuitemradio"
                          aria-checked={o.active}
                          onClick={() => setAmbientLevel(o.level)}
                          className={`h-8 px-2.5 rounded-md text-xs font-semibold cursor-pointer ${
                            o.active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between h-11 px-3 text-[13px] text-slate-100">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" /> {t.languageLabel}
                    </span>
                    <div className="flex rounded-lg border border-slate-700 p-0.5">
                      {LANGS.map((code) => (
                        <button
                          key={code}
                          role="menuitemradio"
                          aria-checked={lang === code}
                          onClick={() => chooseLang(code)}
                          className={`h-8 w-9 rounded-md text-xs font-bold cursor-pointer ${
                            lang === code ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {code.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false);
                      setShowMethod(true);
                    }}
                    className="w-full h-11 flex items-center gap-2 px-3 rounded-xl hover:bg-slate-800 text-[13px] font-semibold text-amber-300 cursor-pointer"
                  >
                    <Info className="w-4 h-4" /> {t.methodBtn}
                  </button>

                  <div className="border-t border-slate-800 mt-1 pt-2 px-3 pb-1 space-y-1 text-[11px] leading-snug text-slate-400">
                    <span className="block font-semibold text-slate-300">{t.helpTitle}</span>
                    <span className="block"><strong className="text-slate-200">{t.helpDrag}</strong> {t.helpDragSub}</span>
                    <span className="block"><strong className="text-slate-200">{t.helpDblClick}</strong> {t.helpDblClickSub}</span>
                    <span className="block"><strong className="text-slate-200">{t.helpOrbit}</strong> {t.helpOrbitSub}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Undo toast for the automatic changes ("Adjust", "Add N lights") */}
        {toast && (
          <div
            role="status"
            className="absolute left-1/2 -translate-x-1/2 bottom-16 max-lg:bottom-3 z-30 flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-[13px] text-slate-100 max-w-[calc(100%-1.5rem)]"
          >
            <span className="truncate">{toast.message}</span>
            <button
              type="button"
              onClick={handleUndo}
              className="shrink-0 h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold cursor-pointer"
            >
              {t.undo}
            </button>
          </div>
        )}

        {/* Bottom help pill (desktop) — can be closed; the same tips stay in the "⋯" menu */}
        {showHints && (
        <div className="absolute bottom-4 left-4 z-10 hidden xl:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 pl-3.5 pr-1.5 py-1.5 rounded-xl text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <strong>{t.helpDrag}</strong> {t.helpDragSub}
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong>{t.helpDblClick}</strong> {t.helpDblClickSub}
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong>{t.helpOrbit}</strong> {t.helpOrbitSub}
          </span>
          <button
            type="button"
            onClick={hideHints}
            aria-label={t.dismissHint}
            title={t.dismissHint}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        )}
      </div>

      {/* Right Control Studio Sidebar */}
      <aside
        ref={asideRef}
        className={`w-96 max-w-full h-full bg-slate-900/95 backdrop-blur-2xl max-[900px]:backdrop-blur-none border-l border-slate-800/90 flex flex-col z-20 shadow-2xl max-lg:w-full max-lg:max-w-none max-lg:shrink-0 max-lg:border-l-0 max-lg:border-t max-lg:rounded-t-2xl max-lg:pb-[env(safe-area-inset-bottom)] ${
          sheetOpen ? 'max-lg:h-[min(58dvh,560px)]' : 'max-lg:h-auto'
        }`}
      >
        {/* Mobile/tablet: handle + tabs are the drag zone of the bottom sheet (tap or swipe) */}
        <div
          ref={dragZoneRef}
          className="shrink-0 max-lg:touch-none"
          onPointerDown={handleSheetPointerDown}
          onPointerMove={handleSheetPointerMove}
          onPointerUp={handleSheetPointerUp}
          onPointerCancel={handleSheetPointerUp}
          onClickCapture={handleSheetClickCapture}
        >
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          aria-label={sheetOpen ? t.collapsePanel : t.expandPanel}
          className="lg:hidden flex items-center justify-center w-full pt-2 pb-0.5 cursor-pointer"
        >
          <span className="w-10 h-1 rounded-full bg-slate-600" />
        </button>

        {/* Lighting summary: full on desktop and on the collapsed phone sheet, one line while it is open */}
        <LightingCard
          variant="full"
          className={`border-b border-slate-800/80 ${sheetOpen ? 'max-lg:hidden' : ''}`}
          t={t}
          lang={lang}
          lux={averageLux}
          roomType={roomType}
          onRoomType={(id) => setRoom((r) => ({ ...r, roomType: id }))}
          mood={luxMoodShort}
          assessment={luxAssessment}
          plan={plan}
          onAdjust={handleAdjustLights}
          onAddLights={handleAddLights}
          onMethod={() => setShowMethod(true)}
        />
        <LightingCard
          variant="compact"
          className={sheetOpen ? 'lg:hidden' : 'hidden'}
          t={t}
          lang={lang}
          lux={averageLux}
          roomType={roomType}
          mood={luxMoodShort}
          assessment={luxAssessment}
          plan={plan}
        />

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/60 border-b border-slate-800/80">
          <button
            onClick={() => handleTabClick('lamps')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 max-sm:px-1.5 max-sm:gap-1 max-sm:whitespace-nowrap max-[400px]:[&>svg]:hidden rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'lamps'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>
              {t.tabLamps} ({lamps.length})
            </span>
          </button>

          <button
            onClick={() => handleTabClick('room')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 max-sm:px-1.5 max-sm:gap-1 max-sm:whitespace-nowrap max-[400px]:[&>svg]:hidden rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'room'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>{t.tabRoom}</span>
          </button>

          <button
            onClick={() => handleTabClick('furniture')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 max-sm:px-1.5 max-sm:gap-1 max-sm:whitespace-nowrap max-[400px]:[&>svg]:hidden rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'furniture'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sofa className="w-4 h-4" />
            <span>
              {t.tabFurniture} ({furniture.length})
            </span>
          </button>
        </div>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 ${sheetOpen ? '' : 'max-lg:hidden'}`}>
          {/* ==========================================================
              TAB 1: LAMPS (COLOR TEMPERATURE, LUMENS, WATTS, FIXTURE SIZE)
          ========================================================== */}
          {activeTab === 'lamps' && (
            <>
              {/* Lamp Selector List with Inline Power, Center, Duplicate & Delete Actions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t.lightPoints}
                  </span>
                  <button
                    onClick={() => handleAddLamp('pendant')}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.addLight}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {localizedLamps.map((l) => {
                    const isSel = selectedLamp?.id === l.id;
                    const hex = kelvinToHex(l.kelvin);
                    return (
                      <div
                        key={l.id}
                        onClick={() => handleSelectLamp(l.id)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-slate-800/95 border-amber-400/80 shadow-md'
                            : 'bg-slate-950/55 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Left: ON/OFF Button + Editable Name & Status */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLampPower(l.id);
                            }}
                            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold border transition-all shrink-0 cursor-pointer ${
                              l.isOn
                                ? 'text-slate-950 border-white/20'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                            style={{
                              backgroundColor: l.isOn ? hex : undefined,
                              boxShadow: l.isOn ? `0 0 10px ${hex}` : 'none',
                            }}
                            title={l.isOn ? t.turnOff : t.turnOn}
                          >
                            {l.isOn ? (
                              <Lightbulb className="w-3 h-3" />
                            ) : (
                              <LightbulbOff className="w-3 h-3" />
                            )}
                            <span>{l.isOn ? 'ON' : 'OFF'}</span>
                          </button>

                          <div className="min-w-0 flex-1">
                            <input
                              type="text"
                              value={l.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLamp(l.id);
                              }}
                              onChange={(e) =>
                                handleUpdateLamp(l.id, {
                                  customName: e.target.value,
                                })
                              }
                              className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none border-b border-transparent focus:border-amber-400 w-full truncate block"
                            />
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {l.isOn
                                ? `${l.watts}W • ${l.lumens}lm • ${l.kelvin}K`
                                : t.off}
                            </p>
                          </div>
                        </div>

                        {/* Right: quick actions (center, duplicate, delete), on the selected row only */}
                        <div className={`items-center gap-1 ml-2 shrink-0 ${isSel ? 'flex' : 'hidden'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateLamp(l.id, { x: 0, z: 0 });
                            }}
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                            title={t.centerLamp}
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateLamp(l);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                            title={t.duplicateLamp}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLamp(l.id);
                            }}
                            disabled={lamps.length <= 1}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 disabled:opacity-30 transition-colors cursor-pointer"
                            title={t.deleteLamp}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedLamp && (
                <div className="space-y-4 pt-3 border-t border-slate-800/80">
                  {/* Light color: the three common choices */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block">{t.lightColor}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: t.warmWhite, kelvin: 2700 },
                        { label: t.neutralWhite, kelvin: 4000 },
                        { label: t.coolWhite, kelvin: 6500 },
                      ].map((preset) => {
                        const active = Math.abs(selectedLamp.kelvin - preset.kelvin) < 250;
                        const bgHex = kelvinToHex(preset.kelvin);
                        return (
                          <button
                            key={preset.kelvin}
                            onClick={() => handleUpdateLamp(selectedLamp.id, { kelvin: preset.kelvin, isOn: true })}
                            aria-pressed={active}
                            className={`min-h-11 px-2 py-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                              active
                                ? 'bg-amber-500/10 border-amber-400 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 text-xs font-semibold leading-tight text-center">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: bgHex, boxShadow: `0 0 6px ${bgHex}` }}
                              />
                              {preset.label}
                            </span>
                            <span className={`text-[10px] ${active ? 'text-amber-300' : 'text-slate-400'}`}>
                              {preset.kelvin}K
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Brightness: lumens slider + the usual LED bulbs as shortcuts */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="lamp-lumens" className="text-xs font-semibold text-slate-200">
                        {t.brightness}
                      </label>
                      <span className="text-xs font-bold text-amber-300 tabular-nums">
                        {selectedLamp.lumens} lm · {selectedLamp.watts} W
                      </span>
                    </div>
                    <input
                      id="lamp-lumens"
                      type="range"
                      min={LAMP_MIN_LM}
                      max={LAMP_MAX_LM}
                      step={50}
                      value={selectedLamp.lumens}
                      onChange={(e) => {
                        const lm = Number(e.target.value);
                        handleUpdateLamp(selectedLamp.id, { lumens: lm, watts: lumensToWatts(lm), isOn: true });
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="grid grid-cols-6 gap-1">
                      {WATT_PRESETS.map((wp) => {
                        const isMatch = Math.abs(selectedLamp.watts - wp.watts) < 0.8;
                        return (
                          <button
                            key={wp.watts}
                            onClick={() =>
                              handleUpdateLamp(selectedLamp.id, { watts: wp.watts, lumens: wp.lumens, isOn: true })
                            }
                            aria-pressed={isMatch}
                            title={`${wp.label} • ${wp.lumens} lm`}
                            className={`h-8 rounded-lg border text-[11px] transition-all cursor-pointer ${
                              isMatch
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {wp.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fixture type */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block">{t.fixture}</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['pendant', 'plafon', 'spot', 'floor_lamp'].map((id) => (
                        <button
                          key={id}
                          onClick={() => handleUpdateLamp(selectedLamp.id, { type: id, nameKey: null })}
                          aria-pressed={selectedLamp.type === id}
                          className={`h-9 px-1 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedLamp.type === id
                              ? 'bg-amber-500/10 border-amber-400 text-white font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t.typeShort[id]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced: exact Kelvin, watts, size, pendant height */}
                  <div className="rounded-xl border border-dashed border-slate-700">
                    <button
                      type="button"
                      onClick={() => setAdvOpen((o) => !o)}
                      aria-expanded={advOpen}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left cursor-pointer"
                    >
                      <span>
                        <span className="block text-[13px] font-semibold text-slate-200">{t.advanced}</span>
                        <span className="block text-[11px] text-slate-400">{t.advancedSub}</span>
                      </span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${advOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {advOpen && (
                      <div className="px-3.5 pb-3.5 space-y-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="lamp-kelvin" className="text-slate-400">{t.exactKelvin}</label>
                            <span className="font-semibold text-white">{selectedLamp.kelvin} K</span>
                          </div>
                          <input
                            id="lamp-kelvin"
                            type="range"
                            min={2000}
                            max={7000}
                            step={100}
                            value={selectedLamp.kelvin}
                            onChange={(e) =>
                              handleUpdateLamp(selectedLamp.id, { kelvin: Number(e.target.value), isOn: true })
                            }
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background:
                                'linear-gradient(to right, #ff8a12 0%, #ffb46b 25%, #ffdead 50%, #fff4e5 75%, #dbeafe 100%)',
                            }}
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{t.kelvin2000}</span>
                            <span>{t.kelvin7000}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="lamp-watts" className="text-slate-400">{t.powerConsumed}</label>
                            <span className="font-semibold text-white">{selectedLamp.watts} W</span>
                          </div>
                          <input
                            id="lamp-watts"
                            type="range"
                            min={2}
                            max={48}
                            step={1}
                            value={selectedLamp.watts}
                            onChange={(e) => {
                              const w = Number(e.target.value);
                              handleUpdateLamp(selectedLamp.id, { watts: w, lumens: wattsToLumens(w), isOn: true });
                            }}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="lamp-scale" className="text-slate-400">{t.lampSize}</label>
                            <span className="font-semibold text-white">{Math.round(selectedLamp.scale * 100)}%</span>
                          </div>
                          <input
                            id="lamp-scale"
                            type="range"
                            min={0.5}
                            max={2.4}
                            step={0.05}
                            value={selectedLamp.scale}
                            onChange={(e) => handleUpdateLamp(selectedLamp.id, { scale: Number(e.target.value) })}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>

                        {selectedLamp.type === 'pendant' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <label htmlFor="lamp-drop" className="text-slate-400">{t.pendantHeight}</label>
                              <span className="font-semibold text-white">
                                {selectedLamp.heightOffset >= 0 ? t.high : `${selectedLamp.heightOffset}m`}
                              </span>
                            </div>
                            <input
                              id="lamp-drop"
                              type="range"
                              min={-1.0}
                              max={0.3}
                              step={0.05}
                              value={selectedLamp.heightOffset || 0}
                              onChange={(e) =>
                                handleUpdateLamp(selectedLamp.id, { heightOffset: Number(e.target.value) })
                              }
                              className="w-full accent-amber-400 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}


          {/* ==========================================================
              TAB 2: ROOM (SHAPE, DIMENSIONS, WALLS, FLOOR, PRESETS)
          ========================================================== */}
          {activeTab === 'room' && (
            <div className="space-y-4">
              {/* Ready-made Architectural Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  {t.presetsShort}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(SCENE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handleLoadPreset(key)}
                      className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-left transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 mb-1" />
                      <div className="text-xs font-semibold text-white leading-tight">
                        {t[preset.labelKey]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Shape */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-200 block">
                  {t.shapeShort}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rectangular', label: t.shapeRect },
                    { id: 'l-shape', label: t.shapeL },
                    { id: 'octagonal', label: t.shapeOct },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      onClick={() => setRoom((r) => ({ ...r, shape: sh.id }))}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        room.shape === sh.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions Sliders */}
              <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {t.measures}
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {roomArea} {t.usefulM2}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t.widthX}</span>
                    <span className="font-semibold text-white">{room.width} m</span>
                  </div>
                  <input
                    type="range"
                    min={2.5}
                    max={9.0}
                    step={0.25}
                    value={room.width}
                    onChange={(e) =>
                      setRoom((r) => ({ ...r, width: Number(e.target.value) }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t.depthZ}</span>
                    <span className="font-semibold text-white">{room.depth} m</span>
                  </div>
                  <input
                    type="range"
                    min={2.5}
                    max={9.0}
                    step={0.25}
                    value={room.depth}
                    onChange={(e) =>
                      setRoom((r) => ({ ...r, depth: Number(e.target.value) }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t.heightY}</span>
                    <span className="font-semibold text-white">{room.height} m</span>
                  </div>
                  <input
                    type="range"
                    min={2.3}
                    max={4.2}
                    step={0.05}
                    value={room.height}
                    onChange={(e) =>
                      setRoom((r) => ({ ...r, height: Number(e.target.value) }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Finishes (wall paint, floor), closed by default */}
              <div className="rounded-xl border border-dashed border-slate-700">
                <button
                  type="button"
                  onClick={() => setFinishesOpen((o) => !o)}
                  aria-expanded={finishesOpen}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left cursor-pointer"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-slate-200">{t.finishes}</span>
                    <span className="block text-[11px] text-slate-400 truncate">
                      {t.walls[room.wallColorId]} · {t.floors[room.floorMaterialId]}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: (WALL_COLORS.find((w) => w.id === room.wallColorId) || WALL_COLORS[0]).color }}
                    />
                    <span
                      className="w-4 h-4 rounded-md border border-white/20"
                      style={{ backgroundColor: (FLOOR_MATERIALS.find((f) => f.id === room.floorMaterialId) || FLOOR_MATERIALS[0]).color }}
                    />
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${finishesOpen ? 'rotate-90' : ''}`} />
                  </span>
                </button>
                {finishesOpen && (
                  <div className="px-3.5 pb-3.5 space-y-4">
              {/* Wall Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  {t.wallPaint}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WALL_COLORS.map((wc) => (
                    <button
                      key={wc.id}
                      onClick={() => setRoom((r) => ({ ...r, wallColorId: wc.id }))}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        room.wallColorId === wc.id
                          ? 'bg-slate-800 border-amber-400 text-white font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: wc.color }}
                      />
                      <span className="truncate">{t.walls[wc.id] || wc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Floor Material */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  {t.floorFinish}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FLOOR_MATERIALS.map((fm) => (
                    <button
                      key={fm.id}
                      onClick={() =>
                        setRoom((r) => ({ ...r, floorMaterialId: fm.id }))
                      }
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        room.floorMaterialId === fm.id
                          ? 'bg-slate-800 border-amber-400 text-white font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-md border border-white/20 shrink-0"
                        style={{ backgroundColor: fm.color }}
                      />
                      <span className="truncate">{t.floors[fm.id] || fm.name}</span>
                    </button>
                  ))}
                </div>
              </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 3: FURNITURE & SHADOW PROJECTION
          ========================================================== */}
          {activeTab === 'furniture' && (
            <div className="space-y-4">
              {/* Top Header: Placed Furniture + Dropdown Button to Add New Furniture */}
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t.placedFurniture} ({furniture.length})
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setShowFurnitureMenu((prev) => !prev)}
                      className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addFurnitureBtn}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          showFurnitureMenu ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Popover Menu */}
                    {showFurnitureMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowFurnitureMenu(false)}
                        />
                        <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-40 space-y-1">
                          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                            {t.addFurnitureTitle}
                          </div>
                          {FURNITURE_CATALOG.map((cat) => (
                            <button
                              key={cat.type}
                              onClick={() => handleAddFurniture(cat)}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: cat.defaultColor }}
                                />
                                <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                                  {t.furnitureNames[cat.type] || cat.name}
                                </span>
                              </div>
                              <Plus className="w-3.5 h-3.5 text-sky-400 opacity-75 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Placed Furniture List with Inline Actions */}
                {furniture.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-400">
                    {t.emptyFurniture}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {localizedFurniture.map((f) => {
                      const isSel = selectedFurniture?.id === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => handleSelectFurniture(f.id)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSel
                              ? 'bg-slate-800/95 border-sky-400/80 text-white shadow-md'
                              : 'bg-slate-950/55 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {/* Left: Color Badge + Name + Summary */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                              style={{ backgroundColor: f.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-100 truncate">
                                {f.name}
                              </p>
                              <p className="text-[10px] text-slate-400 leading-tight">
                                {f.rotation}° • {Math.round(f.scale * 100)}%
                              </p>
                            </div>
                          </div>

                          {/* Right: Inline Quick Action Icons (Rotate, Center, Duplicate, Delete) */}
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateFurniture(f.id, {
                                  rotation: (f.rotation + 45) % 360,
                                });
                              }}
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title={`${t.rotation} +45°`}
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateFurniture(f.id, { x: 0, z: 0 });
                              }}
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title={t.centerFurniture}
                            >
                              <Crosshair className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateFurniture(f);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title={t.duplicateFurniture}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFurniture(f.id);
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                              title={t.removeFurniture}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Furniture Inspector Controls */}
              {selectedFurniture && (
                <div className="space-y-4 pt-3 border-t border-slate-800/80">
                  {/* Rotation Control */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {t.rotation}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            handleUpdateFurniture(selectedFurniture.id, {
                              rotation: (selectedFurniture.rotation + 45) % 360,
                            })
                          }
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-sky-300 font-medium cursor-pointer flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" /> +45°
                        </button>
                        <span className="font-semibold text-white w-9 text-right">
                          {selectedFurniture.rotation}°
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={355}
                      step={5}
                      value={selectedFurniture.rotation}
                      onChange={(e) =>
                        handleUpdateFurniture(selectedFurniture.id, {
                          rotation: Number(e.target.value),
                        })
                      }
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {/* Scale Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {t.scaleSize}
                      </span>
                      <span className="font-semibold text-sky-300">
                        {Math.round(selectedFurniture.scale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.65}
                      max={1.5}
                      step={0.05}
                      value={selectedFurniture.scale}
                      onChange={(e) =>
                        handleUpdateFurniture(selectedFurniture.id, {
                          scale: Number(e.target.value),
                        })
                      }
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {/* Color Swatches */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block">
                      {t.finishColor}
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        '#475569',
                        '#cbd5e1',
                        '#78350f',
                        '#b45309',
                        '#15803d',
                        '#1e3a8a',
                        '#881337',
                        '#1e293b',
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            handleUpdateFurniture(selectedFurniture.id, {
                              color: c,
                            })
                          }
                          className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                            selectedFurniture.color === c
                              ? 'scale-125 border-white'
                              : 'border-white/20 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — author credit: small head opens LinkedIn / GitHub / inspiração */}
        <footer
          role="contentinfo"
          className={`relative shrink-0 flex items-center justify-between gap-3 px-4 py-1.5 border-t border-slate-800/80 bg-slate-950/60 ${sheetOpen ? '' : 'max-lg:hidden'}`}
        >
          <span className="whitespace-nowrap font-mono text-[10px] tracking-wider text-slate-500">
            LuminaStudio 3D © 2026
          </span>
          <AuthorCredit lang={lang} />
        </footer>
      </aside>

      {/* How the lux is calculated (formula, live example, references) */}
      <MethodologyModal
        open={showMethod}
        onClose={() => setShowMethod(false)}
        lang={lang}
        t={t}
        hubUrl={`/${lang}/${HUB_SLUG[lang]}/#how`}
        data={{
          lumens: totalLumens,
          area: photometry.geometry.area,
          perimeter: photometry.geometry.perimeter,
          height: room.height,
          k: photometry.k,
          cu: photometry.cu,
          rho: photometry.rho,
          lux: averageLux,
          roomType,
        }}
      />

      {/* Photo Preview & Download Modal */}
      {capturedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-sky-400" />
                  {t.photoTitle}
                </h3>
                <p className="text-xs text-slate-400">{capturedPhoto.summary}</p>
              </div>
              <button
                onClick={() => setCapturedPhoto(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950">
              <img
                src={capturedPhoto.url}
                alt="3D Room Snapshot"
                className="w-full max-h-[60vh] object-contain rounded-xl border border-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 bg-slate-900 border-t border-slate-800">
              <button
                onClick={() => setCapturedPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {t.close}
              </button>
              <button
                onClick={handleDownloadPhoto}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t.downloadPng}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
