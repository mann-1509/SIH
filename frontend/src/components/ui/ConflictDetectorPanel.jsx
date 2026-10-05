import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Focus, Play, ShieldAlert, X, Sparkles, RefreshCw } from 'lucide-react';
import { checkConflictApi } from '../../services/api';

export function ConflictDetectorPanel({ onConflictChecked, onZoomToConflict, onClose }) {
  const [startLat, setStartLat] = useState(23.02280);
  const [startLon, setStartLon] = useState(72.57115);
  const [startDepth, setStartDepth] = useState(-3.5); // Intersects Water Pipe 1 at -3.5m
  const [length, setLength] = useState(55.0);
  const [direction, setDirection] = useState('SOUTH');
  const [safetyClearance, setSafetyClearance] = useState(1.2);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunCheck = async (overrideDepth = null) => {
    setLoading(true);
    const depthToUse = overrideDepth !== null ? overrideDepth : parseFloat(startDepth);
    try {
      const payload = {
        start_lat: parseFloat(startLat),
        start_lon: parseFloat(startLon),
        start_depth: depthToUse,
        length: parseFloat(length),
        direction: direction,
        asset_type: 'water_pipe',
        proposed_radius: 0.35,
        safety_clearance: parseFloat(safetyClearance)
      };

      const res = await checkConflictApi(payload);
      setResult(res);
      onConflictChecked(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetConflict = () => {
    setStartDepth(-3.5);
    setDirection('SOUTH');
    handleRunCheck(-3.5);
  };

  const handlePresetResolved = () => {
    setStartDepth(-7.0);
    setDirection('SOUTH');
    handleRunCheck(-7.0);
  };

  const handleClearAnalysis = () => {
    setResult(null);
    onConflictChecked(null);
  };

  return (
    <div className="absolute top-4 left-4 z-40 w-[410px] max-w-[calc(100vw-2rem)] max-h-[calc(100%-2rem)] flex flex-col cadastre-panel rounded-xl overflow-hidden text-slate-200 animate-in fade-in slide-in-from-left-4 duration-200 select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#151A20]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-100 tracking-tight">3D Conflict Detector</h3>
            <p className="text-[10px] text-slate-400 font-mono">Subterranean Utility Clearance Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-300 font-mono px-2 py-0.5 rounded-md bg-[#090B0E]/80 border border-white/[0.08]">
            Tol: {safetyClearance}m
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close conflict panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {/* Scenario Simulation Presets */}
        <div className="p-3 rounded-lg cadastre-card space-y-2">
          <div className="text-[9.5px] uppercase font-mono font-semibold text-slate-400 flex items-center gap-1.5 tracking-wider">
            <Sparkles className="w-3 h-3 text-sky-400" />
            Simulation Route Presets
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePresetConflict}
              className="py-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.15)] btn-tactile"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Clash @ -3.5m</span>
            </button>
            <button
              onClick={handlePresetResolved}
              className="py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)] btn-tactile"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Clear @ -7.0m</span>
            </button>
          </div>
        </div>

        {/* Proposed Alignment Form Inputs */}
        <div className="space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Start Latitude</label>
              <input
                type="number"
                step="0.00001"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
                className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Start Longitude</label>
              <input
                type="number"
                step="0.00001"
                value={startLon}
                onChange={(e) => setStartLon(e.target.value)}
                className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Depth (m)</label>
              <input
                type="number"
                step="0.5"
                value={startDepth}
                onChange={(e) => setStartDepth(e.target.value)}
                className="w-full h-7.5 px-2 rounded-md cadastre-input text-amber-400 font-mono font-bold text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Length (m)</label>
              <input
                type="number"
                step="1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full h-7.5 px-2 rounded-md cadastre-input text-slate-100 font-mono font-bold text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full h-7.5 px-2 rounded-md cadastre-input text-slate-200 font-medium text-xs"
              >
                <option value="SOUTH">SOUTH (180°)</option>
                <option value="EAST">EAST (90°)</option>
                <option value="NORTH">NORTH (0°)</option>
                <option value="WEST">WEST (270°)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] text-slate-400 font-medium mb-1">
              Safety Clearance Tolerance (meters)
            </label>
            <input
              type="number"
              step="0.1"
              value={safetyClearance}
              onChange={(e) => setSafetyClearance(e.target.value)}
              className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
            />
          </div>

          <button
            onClick={() => handleRunCheck()}
            disabled={loading}
            className="w-full h-8.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_12px_rgba(14,165,233,0.35)] cursor-pointer disabled:opacity-50 mt-1 btn-tactile"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{loading ? 'Evaluating Clearance...' : 'Run 3D Vector Collision Check'}</span>
          </button>
        </div>

        {/* Evaluation Results Card */}
        {result && (
          <div className="pt-1">
            {result.conflict_detected || result.has_conflict ? (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-2.5 animate-in fade-in duration-150 shadow-[0_0_15px_rgba(244,63,94,0.12)]">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>3D SPATIAL CONFLICT DETECTED</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="leading-snug text-[11px]">
                    Proposed alignment breaches clearance margin with{' '}
                    <strong className="text-white">{result.conflicting_asset?.name}</strong>.
                  </p>
                  <div className="flex justify-between font-mono text-[11px] bg-[#090B0E]/90 p-2 rounded-md border border-rose-500/25">
                    <span className="text-slate-400">Closest 3D Distance:</span>
                    <span className="font-bold text-rose-400">{result.min_distance_meters || result.minimum_distance_m}m</span>
                  </div>
                </div>

                {result.conflict_point && (
                  <button
                    onClick={() => onZoomToConflict(result.conflict_point)}
                    className="w-full h-8 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_10px_rgba(244,63,94,0.35)] cursor-pointer btn-tactile"
                  >
                    <Focus className="w-3.5 h-3.5" />
                    <span>Zoom 3D Camera to Conflict Site</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs animate-in fade-in duration-150 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>CLEARANCE VERIFIED · NO CONFLICTS</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">
                  Proposed utility route satisfies statutory clearance criteria across all existing subterranean assets.
                </p>
                <div className="flex justify-between font-mono text-[11px] bg-[#090B0E]/90 p-2 rounded-md border border-emerald-500/25">
                  <span className="text-slate-400">Measured Clearance:</span>
                  <span className="font-bold text-emerald-400">{result.min_distance_meters || result.minimum_distance_m}m</span>
                </div>
              </div>
            )}

            <button
              onClick={handleClearAnalysis}
              className="w-full mt-2 py-1.5 rounded-lg bg-[#151A20] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 text-xs font-medium border border-white/[0.08] transition-all cursor-pointer flex items-center justify-center gap-1.5 btn-tactile"
            >
              <span>Clear Analysis & Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
