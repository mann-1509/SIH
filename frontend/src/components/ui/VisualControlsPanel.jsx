import React from 'react';
import { Sliders, Layers, RotateCcw, Cable } from 'lucide-react';

export function VisualControlsPanel({
  undergroundView,
  setUndergroundView,
  showPipeOverlay = true,
  setShowPipeOverlay,
  activeMapLevel = 'all',
  setActiveMapLevel,
  verticalExaggeration = 1.5,
  setVerticalExaggeration,
  showCrossSection = false,
  setShowCrossSection,
  onResetCamera
}) {
  const handleLevelSelect = (level) => {
    if (setActiveMapLevel) setActiveMapLevel(level);
    if (level === 'surface') {
      setUndergroundView(false);
    } else {
      setUndergroundView(true);
    }
  };

  return (
    <nav
      aria-label="3D Viewport Controls"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 cadastre-panel px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-200 select-none max-w-[calc(100%-1.5rem)] shrink-0 pointer-events-auto"
    >
      {/* 1. Cadastre Level Segmented Switcher */}
      <div className="flex items-center bg-[#090B0E]/80 p-0.5 rounded-lg border border-white/[0.08] h-7.5 shadow-inner">
        <button
          onClick={() => handleLevelSelect('all')}
          className={`h-6.5 px-2.5 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer flex items-center justify-center btn-tactile ${
            activeMapLevel === 'all' && undergroundView
              ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.4)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
          title="Combined surface terrain and subterranean utilities"
        >
          All Layers
        </button>
        <button
          onClick={() => handleLevelSelect('surface')}
          className={`h-6.5 px-2.5 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer flex items-center justify-center btn-tactile ${
            !undergroundView || activeMapLevel === 'surface'
              ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.4)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
          title="Surface terrain and building parcels"
        >
          Surface
        </button>
        <button
          onClick={() => handleLevelSelect('underground')}
          className={`h-6.5 px-2.5 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer flex items-center justify-center btn-tactile ${
            undergroundView && activeMapLevel === 'underground'
              ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.4)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
          title="Subsurface utilities and foundation depth planes"
        >
          Subsurface
        </button>
      </div>

      <div className="h-4 w-px bg-white/[0.08] shrink-0" aria-hidden="true" />

      {/* 2. Global Underground Utilities Overlay Toggle */}
      <button
        onClick={() => setShowPipeOverlay && setShowPipeOverlay(!showPipeOverlay)}
        aria-pressed={showPipeOverlay}
        className={`h-7.5 px-2.5 sm:px-3 rounded-lg border flex items-center gap-2 text-[11px] font-medium transition-all duration-150 cursor-pointer shrink-0 btn-tactile ${
          showPipeOverlay
            ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
            : 'bg-[#171C22]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
        title="Toggle subsurface utility overlay through ground terrain"
      >
        <Cable className={`w-3.5 h-3.5 ${showPipeOverlay ? 'text-sky-400' : 'text-slate-400'}`} />
        <span className="whitespace-nowrap">Utility Pipes</span>
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${
            showPipeOverlay ? 'bg-sky-400 shadow-[0_0_6px_#38BDF8]' : 'bg-slate-600'
          }`}
        />
      </button>

      <div className="h-4 w-px bg-white/[0.08] shrink-0 hidden sm:block" aria-hidden="true" />

      {/* 3. Vertical Exaggeration Z-Scale Slider */}
      <div className="hidden sm:flex items-center gap-2 px-2.5 h-7.5 bg-[#171C22]/80 rounded-lg border border-white/[0.08] shrink-0">
        <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-400 text-[10px] font-medium uppercase font-mono whitespace-nowrap">Z-Scale:</span>
        <input
          type="range"
          min="1.0"
          max="4.0"
          step="0.5"
          value={verticalExaggeration}
          onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
          className="w-14 h-1 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-sky-400"
          title="Adjust vertical depth exaggeration"
        />
        <span className="font-mono text-[11px] font-bold text-sky-400 w-6 text-right shrink-0">
          {verticalExaggeration.toFixed(1)}x
        </span>
      </div>

      <div className="h-4 w-px bg-white/[0.08] shrink-0" aria-hidden="true" />

      {/* 4. Cross-Section Cut Plane Toggle */}
      <button
        onClick={() => setShowCrossSection(!showCrossSection)}
        className={`h-7.5 px-2.5 sm:px-3 rounded-lg border flex items-center gap-1.5 text-[11px] font-medium transition-all duration-150 cursor-pointer shrink-0 btn-tactile ${
          showCrossSection
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
            : 'bg-[#171C22]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
        title="Toggle vertical cross-section plane"
      >
        <Layers className={`w-3.5 h-3.5 ${showCrossSection ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="hidden md:inline whitespace-nowrap">Cross-Section</span>
      </button>

      {/* 5. Reset Camera View Button */}
      <button
        onClick={onResetCamera}
        className="h-7.5 px-2.5 sm:px-3 rounded-lg bg-[#171C22]/80 hover:bg-white/[0.08] border border-white/[0.08] hover:border-slate-400 flex items-center gap-1.5 text-slate-300 hover:text-white transition-all duration-150 cursor-pointer shrink-0 btn-tactile"
        title="Reset 3D camera to default isometric overview"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline text-[11px]">Recenter</span>
      </button>
    </nav>
  );
}
