import React, { useState, useMemo, useRef } from 'react';
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
  Check,
  Move,
  Crosshair,
  Globe,
  ChevronDown,
} from 'lucide-react';
import Scene3D from './components/Scene3D';
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
} from './utils/lightingPhysics';
import { TRANSLATIONS } from './utils/i18n';

export default function App() {
  const [lang, setLang] = useState('pt'); // 'pt' | 'en'
  const t = TRANSLATIONS[lang];

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

  const canvasRef = useRef(null);

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
  const averageLux = useMemo(
    () => Math.round(totalLumens / Math.max(1, roomArea)),
    [totalLumens, roomArea]
  );

  const luxAssessment = useMemo(() => {
    if (averageLux <= 0) {
      return { label: t.luxDark, color: 'text-slate-400', bg: 'bg-slate-800/80' };
    }
    if (averageLux < 80) {
      return { label: t.luxDim, color: 'text-amber-300', bg: 'bg-amber-950/70' };
    }
    if (averageLux < 200) {
      return { label: t.luxCozy, color: 'text-emerald-300', bg: 'bg-emerald-950/70' };
    }
    if (averageLux < 450) {
      return { label: t.luxIdeal, color: 'text-sky-300', bg: 'bg-sky-950/70' };
    }
    return { label: t.luxIntense, color: 'text-purple-300', bg: 'bg-purple-950/70' };
  }, [averageLux, t]);

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
      const canvas = document.querySelector('canvas');
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

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none flex">
      {/* 3D Interactive Viewport */}
      <div className="flex-1 h-full relative">
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

        {/* Top Floating Bar — Brand + Photometric HUD + Actions */}
        <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Brand & Live Photometry */}
          <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2.5 pr-3 border-r border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
                <Lightbulb className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  LuminaStudio{' '}
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3D
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">{t.subtitle}</p>
              </div>
            </div>

            {/* Live Photometric Metrics */}
            <div className="hidden xl:flex items-center gap-4 text-xs px-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                  {t.totalFlux}
                </span>
                <span className="font-semibold text-amber-300">{totalLumens} lm</span>
                <span className="text-slate-500 ml-1">({totalWatts}W)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                  {t.usefulArea}
                </span>
                <span className="font-semibold text-slate-200">{roomArea} m²</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                  {t.avgIlluminance}
                </span>
                <span className="font-bold text-white">{averageLux} lux</span>
              </div>
              <div
                className={`px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium ${luxAssessment.bg} ${luxAssessment.color}`}
              >
                {luxAssessment.label}
              </div>
            </div>
          </div>

          {/* Right Quick Action Bar */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl pointer-events-auto">
            {/* Master Power Toggle */}
            <button
              onClick={handleToggleAllLamps}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                anyLampOn
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={t.toggleAllTitle}
            >
              {anyLampOn ? (
                <Lightbulb className="w-4 h-4" />
              ) : (
                <LightbulbOff className="w-4 h-4" />
              )}
              <span>{anyLampOn ? t.lightsOn : t.lightsOff}</span>
            </button>

            {/* Camera Angles */}
            <div className="hidden sm:flex items-center bg-slate-950/70 rounded-xl p-0.5 border border-slate-800">
              {[
                { id: 'perspective', label: t.cam3d },
                { id: 'top', label: t.camTop },
                { id: 'front', label: t.camFront },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setCameraView(v.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    cameraView === v.id
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid((g) => !g)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showGrid
                  ? 'bg-slate-800 text-sky-400 border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={t.gridTitle}
            >
              <GridIcon className="w-4 h-4" />
            </button>

            {/* Night / Twilight Ambient Toggle */}
            <button
              onClick={() => setAmbientLevel((a) => (a < 0.1 ? 0.22 : 0.03))}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
              title={t.ambientTitle}
            >
              {ambientLevel < 0.1 ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Language Toggle (PT / EN) */}
            <button
              onClick={() => setLang((l) => (l === 'pt' ? 'en' : 'pt'))}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer"
              title={t.switchLangTitle}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Take Photo Button */}
            <button
              onClick={handleTakePhoto}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t.takePhoto}</span>
            </button>
          </div>
        </header>

        {/* Bottom Interactive Help Pill */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden lg:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3.5 py-2 rounded-xl text-[11px] text-slate-300">
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
        </div>
      </div>

      {/* Right Control Studio Sidebar */}
      <aside className="w-96 max-w-full h-full bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800/90 flex flex-col z-20 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/60 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('lamps')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
            onClick={() => setActiveTab('room')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'room'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>{t.tabRoom}</span>
          </button>

          <button
            onClick={() => setActiveTab('furniture')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
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

                        {/* Right: Inline Quick Action Icons (Center, Duplicate, Delete) */}
                        <div className="flex items-center gap-1 ml-2 shrink-0">
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
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  {/* Color Temperature (Warm / Neutral / Cool White) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200">
                        {t.colorTempLabel}
                      </label>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md border border-black/20 text-slate-950"
                        style={{ backgroundColor: kelvinToHex(selectedLamp.kelvin) }}
                      >
                        {selectedLamp.kelvin}K
                      </span>
                    </div>

                    {/* Main 3 Featured Temperature Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: t.warmWhite, kelvin: 2700, sub: t.warmSub },
                        { label: t.neutralWhite, kelvin: 4000, sub: t.neutralSub },
                        { label: t.coolWhite, kelvin: 6500, sub: t.coolSub },
                      ].map((preset) => {
                        const active =
                          Math.abs(selectedLamp.kelvin - preset.kelvin) < 250;
                        const bgHex = kelvinToHex(preset.kelvin);
                        return (
                          <button
                            key={preset.kelvin}
                            onClick={() =>
                              handleUpdateLamp(selectedLamp.id, {
                                kelvin: preset.kelvin,
                                isOn: true,
                              })
                            }
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              active
                                ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/50'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                                style={{
                                  backgroundColor: bgHex,
                                  boxShadow: `0 0 8px ${bgHex}`,
                                }}
                              />
                              {active && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <span className="text-xs font-bold text-white leading-tight mt-0.5">
                              {preset.label}
                            </span>
                            <span className="text-[10px] text-slate-400">{preset.sub}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Continuous Kelvin Spectrum Slider */}
                    <div className="space-y-1 pt-0.5">
                      <input
                        type="range"
                        min={2000}
                        max={7000}
                        step={100}
                        value={selectedLamp.kelvin}
                        onChange={(e) =>
                          handleUpdateLamp(selectedLamp.id, {
                            kelvin: Number(e.target.value),
                            isOn: true,
                          })
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background:
                            'linear-gradient(to right, #ff8a12 0%, #ffb46b 25%, #ffdead 50%, #fff4e5 75%, #dbeafe 100%)',
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{t.kelvin2000}</span>
                        <span>{t.kelvin3000}</span>
                        <span>{t.kelvin5000}</span>
                        <span>{t.kelvin7000}</span>
                      </div>
                    </div>
                  </div>

                  {/* Power (Watts) & Luminous Flux (Lumens) */}
                  <div className="space-y-2.5 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200">
                        {t.powerBrightness}
                      </label>
                      <span className="text-xs font-bold text-amber-300">
                        {selectedLamp.watts}W LED ≈ {selectedLamp.lumens} lm
                      </span>
                    </div>

                    {/* Quick Commercial Bulb Wattage Presets */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {WATT_PRESETS.map((wp) => {
                        const isMatch = Math.abs(selectedLamp.watts - wp.watts) < 0.8;
                        return (
                          <button
                            key={wp.watts}
                            onClick={() =>
                              handleUpdateLamp(selectedLamp.id, {
                                watts: wp.watts,
                                lumens: wp.lumens,
                                isOn: true,
                              })
                            }
                            className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              isMatch
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-[11px]">
                              {wp.label} • {wp.lumens}lm
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Lumens Slider */}
                    <div className="space-y-0.5 pt-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{t.luminousFlux}</span>
                        <span className="font-semibold text-white">
                          {selectedLamp.lumens} lm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={200}
                        max={4500}
                        step={50}
                        value={selectedLamp.lumens}
                        onChange={(e) => {
                          const lm = Number(e.target.value);
                          handleUpdateLamp(selectedLamp.id, {
                            lumens: lm,
                            watts: lumensToWatts(lm),
                            isOn: true,
                          });
                        }}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Watts LED Slider */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{t.powerConsumed}</span>
                        <span className="font-semibold text-white">
                          {selectedLamp.watts} W
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={48}
                        step={1}
                        value={selectedLamp.watts}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          handleUpdateLamp(selectedLamp.id, {
                            watts: w,
                            lumens: wattsToLumens(w),
                            isOn: true,
                          });
                        }}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Fixture Style & Size */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      {t.fixtureModelSize}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'pendant', label: t.typePendant },
                        { id: 'plafon', label: t.typePlafon },
                        { id: 'spot', label: t.typeSpot },
                        { id: 'floor_lamp', label: t.typeFloor },
                      ].map((itemType) => (
                        <button
                          key={itemType.id}
                          onClick={() =>
                            handleUpdateLamp(selectedLamp.id, {
                              type: itemType.id,
                              nameKey: null,
                            })
                          }
                          className={`py-1.5 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            selectedLamp.type === itemType.id
                              ? 'bg-slate-800 border-amber-400 text-white font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {itemType.label}
                        </button>
                      ))}
                    </div>

                    {/* Lamp Size (Scale) Slider */}
                    <div className="space-y-0.5 pt-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{t.lampSize}</span>
                        <span className="font-semibold text-amber-300">
                          {Math.round(selectedLamp.scale * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={2.4}
                        step={0.05}
                        value={selectedLamp.scale}
                        onChange={(e) =>
                          handleUpdateLamp(selectedLamp.id, {
                            scale: Number(e.target.value),
                          })
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Pendant Cord Drop Height */}
                    {selectedLamp.type === 'pendant' && (
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">{t.pendantHeight}</span>
                          <span className="font-semibold text-slate-200">
                            {selectedLamp.heightOffset >= 0
                              ? t.high
                              : `${selectedLamp.heightOffset}m`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-1.0}
                          max={0.3}
                          step={0.05}
                          value={selectedLamp.heightOffset || 0}
                          onChange={(e) =>
                            handleUpdateLamp(selectedLamp.id, {
                              heightOffset: Number(e.target.value),
                            })
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
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
                  {t.presetsTitle}
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
                  {t.roomShapeLabel}
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
                    {t.roomDims}
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
      </aside>

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
