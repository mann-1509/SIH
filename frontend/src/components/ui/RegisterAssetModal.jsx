import React, { useState } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Focus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { registerPipelineApi, registerPropertyApi, checkConflictApi } from '../../services/api';

export function RegisterAssetModal({ onAssetRegistered, onClose, onViewConflictIn3D }) {
  const [assetCategory, setAssetCategory] = useState('pipeline');

  // Pipeline form state
  const [pipeName, setPipeName] = useState('Secondary Distribution Pipe D');
  const [pipeType, setPipeType] = useState('water_pipe');
  const [ownerAgency, setOwnerAgency] = useState('Ahmedabad Municipal Corp');
  const [startLat, setStartLat] = useState(23.02280);
  const [startLon, setStartLon] = useState(72.57115);
  const [startDepth, setStartDepth] = useState(-3.5); // Default to -3.5m to demonstrate conflict gate
  const [length, setLength] = useState(55.0);
  const [direction, setDirection] = useState('SOUTH');
  const [safetyClearance, setSafetyClearance] = useState(1.2);
  const [proposedRadius, setProposedRadius] = useState(0.35);

  // Property form state
  const [propName, setPropName] = useState('Commercial Complex D');
  const [propLat, setPropLat] = useState(23.02210);
  const [propLon, setPropLon] = useState(72.57140);
  const [propHeight, setPropHeight] = useState(24.0);
  const [numFloors, setNumFloors] = useState(6);

  // Workflow state machine: 'IDLE' | 'CHECKING' | 'CONFLICT' | 'SAFE' | 'SUCCESS'
  const [statusState, setStatusState] = useState('IDLE');
  const [conflictData, setConflictData] = useState(null);
  const [safeData, setSafeData] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Pre-Check spatial clearance without saving
  const handleCheckClearance = async (overrideDepth = null) => {
    setStatusState('CHECKING');
    setErrorMsg(null);
    const depthToUse = overrideDepth !== null ? overrideDepth : parseFloat(startDepth);

    try {
      const payload = {
        start_lat: parseFloat(startLat),
        start_lon: parseFloat(startLon),
        start_depth: depthToUse,
        length: parseFloat(length),
        direction: direction,
        asset_type: pipeType,
        proposed_radius: parseFloat(proposedRadius),
        safety_clearance: parseFloat(safetyClearance)
      };

      const res = await checkConflictApi(payload);

      if (res.has_conflict || res.conflict_detected || res.conflict) {
        setConflictData(res);
        setSafeData(null);
        setStatusState('CONFLICT');
        if (onViewConflictIn3D) {
          onViewConflictIn3D(res, null);
        }
      } else {
        setSafeData(res);
        setConflictData(null);
        setStatusState('SAFE');
        if (onViewConflictIn3D) {
          onViewConflictIn3D(res, null);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error evaluating spatial clearance.');
      setStatusState('IDLE');
    }
  };

  // Full Register Flow: Evaluates conflict gate on backend before commit
  const handleRegisterPipeline = async (e) => {
    if (e) e.preventDefault();
    setStatusState('CHECKING');
    setErrorMsg(null);

    try {
      const payload = {
        name: pipeName,
        asset_type: pipeType,
        owner_agency: ownerAgency,
        start_lat: parseFloat(startLat),
        start_lon: parseFloat(startLon),
        start_depth: parseFloat(startDepth),
        length: parseFloat(length),
        direction: direction,
        proposed_radius: parseFloat(proposedRadius),
        safety_clearance: parseFloat(safetyClearance),
        check_conflicts: true,
        metadata: {
          material: pipeType === 'water_pipe' ? 'Ductile Iron' : 'Armored XLPE / HDPE',
          registered_by: 'Ahmedabad Urban Cadastre Authority'
        }
      };

      const res = await registerPipelineApi(payload);

      if (res.conflict || res.has_conflict || res.success === false || res.safe === false) {
        setConflictData(res);
        setSafeData(null);
        setStatusState('CONFLICT');
        if (onViewConflictIn3D) {
          onViewConflictIn3D(res, null);
        }
        return;
      }

      setSuccessResult(res);
      setStatusState('SUCCESS');
      if (onAssetRegistered && res.asset) {
        onAssetRegistered(res.asset);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register pipeline asset.');
      setStatusState('IDLE');
    }
  };

  // Handle building property registration
  const handleRegisterProperty = async (e) => {
    e.preventDefault();
    setStatusState('CHECKING');
    setErrorMsg(null);

    try {
      const payload = {
        name: propName,
        asset_type: 'building',
        owner_agency: ownerAgency,
        latitude: parseFloat(propLat),
        longitude: parseFloat(propLon),
        elevation: 0.0,
        length: 16.0,
        width: 14.0,
        height: parseFloat(propHeight),
        num_floors: parseInt(numFloors),
        address: 'Sector 3, Ashram Road, Ahmedabad',
        property_type: 'Commercial'
      };

      const res = await registerPropertyApi(payload);
      setSuccessResult(res);
      setStatusState('SUCCESS');
      if (onAssetRegistered && res.building) {
        onAssetRegistered(res.building);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register property.');
      setStatusState('IDLE');
    }
  };

  const handleViewConflictIn3D = () => {
    if (!conflictData) return;
    const targetPoint = conflictData.conflict_point || (
      conflictData.conflicts?.[0]
        ? {
            x: conflictData.conflicts[0].conflict_x,
            y: conflictData.conflicts[0].conflict_y,
            z: conflictData.conflicts[0].conflict_z
          }
        : null
    );

    if (onViewConflictIn3D && targetPoint) {
      onViewConflictIn3D(conflictData, targetPoint);
    }
    setIsMinimized(true);
  };

  const handlePresetConflict = () => {
    setStartDepth(-3.5);
    setDirection('SOUTH');
    setStartLat(23.02280);
    setStartLon(72.57115);
    setLength(55.0);
    handleCheckClearance(-3.5);
  };

  const handlePresetResolved = () => {
    setStartDepth(-7.0);
    setDirection('SOUTH');
    setStartLat(23.02280);
    setStartLon(72.57115);
    setLength(55.0);
    handleCheckClearance(-7.0);
  };

  // Minimized Docked Widget View
  if (isMinimized) {
    return (
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 p-2 px-3 cadastre-panel rounded-xl text-slate-200 animate-in fade-in duration-150 select-none">
        {statusState === 'CONFLICT' ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Registration Blocked (Conflict in 3D View)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <PlusCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Register Asset Draft</span>
          </div>
        )}
        <button
          onClick={() => setIsMinimized(false)}
          className="ml-2 px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer btn-tactile"
        >
          <span>Expand</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-40 w-[420px] max-w-[calc(100vw-2rem)] max-h-[calc(100%-2rem)] flex flex-col cadastre-panel rounded-xl overflow-hidden text-slate-200 animate-in fade-in slide-in-from-left-4 duration-200 select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#151A20]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7.5 h-7.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-100 tracking-tight">Register Spatial Asset</h3>
            <p className="text-[10px] text-slate-400 font-mono">Automated 3D Clearance Gate</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Category Switcher */}
          <div className="flex bg-[#090B0E]/80 p-0.5 rounded-lg border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setAssetCategory('pipeline');
                setStatusState('IDLE');
                setConflictData(null);
                setSafeData(null);
                setSuccessResult(null);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer btn-tactile ${
                assetCategory === 'pipeline'
                  ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Utility
            </button>
            <button
              type="button"
              onClick={() => {
                setAssetCategory('building');
                setStatusState('IDLE');
                setConflictData(null);
                setSafeData(null);
                setSuccessResult(null);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer btn-tactile ${
                assetCategory === 'building'
                  ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Building
            </button>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Minimize"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close registration"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {/* Quick Demo Presets */}
        {assetCategory === 'pipeline' && (
          <div className="p-3 rounded-lg cadastre-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-mono font-semibold text-slate-400 flex items-center gap-1.5 tracking-wider">
                <Sparkles className="w-3 h-3 text-sky-400" />
                Quick Test Alignment Presets
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tol: {safetyClearance}m</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePresetConflict}
                className="py-1.5 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[11px] font-semibold border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.12)] btn-tactile"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Test 1: Conflict (-3.5m)</span>
              </button>
              <button
                type="button"
                onClick={handlePresetResolved}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.12)] btn-tactile"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Test 2: Safe (-7.0m)</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. CHECKING State */}
        {statusState === 'CHECKING' && (
          <div className="p-3 rounded-lg bg-[#151A20] border border-sky-500/30 text-xs flex items-center gap-3 animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.15)]">
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
            <div>
              <div className="font-semibold text-slate-100">Evaluating 3D Clearance Geometry...</div>
              <div className="text-[10.5px] text-slate-400">Verifying spatial distance against existing subterranean network.</div>
            </div>
          </div>
        )}

        {/* 2. CONFLICT State */}
        {statusState === 'CONFLICT' && conflictData && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-2.5 animate-in fade-in duration-150 shadow-[0_0_15px_rgba(244,63,94,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>SPATIAL CONFLICT DETECTED</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                REGISTRATION BLOCKED
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              Proposed utility route breaches statutory clearance with registered underground infrastructure.
            </p>

            {/* Conflicting Assets */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {(conflictData.conflicts || [conflictData.conflicting_asset]).map((conf, idx) => {
                if (!conf) return null;
                const minDistance = conf.minimum_distance_m !== undefined ? conf.minimum_distance_m : (conflictData.minimum_distance_m || 0.35);
                const reqClearance = conf.required_clearance_m || conflictData.required_clearance_m || safetyClearance;

                return (
                  <div key={idx} className="p-2.5 rounded-md bg-[#090B0E]/90 border border-rose-500/20 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100 truncate">
                        {conf.existing_name || 'Conflicting Utility Asset'}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                        {conf.existing_type?.replace('_', ' ') || 'water pipe'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-0.5">
                      <div className="p-1 rounded bg-[#151A20] flex justify-between border border-white/[0.04]">
                        <span className="text-slate-400">Measured:</span>
                        <span className="font-bold text-rose-400">{minDistance} m</span>
                      </div>
                      <div className="p-1 rounded bg-[#151A20] flex justify-between border border-white/[0.04]">
                        <span className="text-slate-400">Required:</span>
                        <span className="font-bold text-slate-200">{reqClearance} m</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleViewConflictIn3D}
                className="h-8 px-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_8px_rgba(244,63,94,0.35)] cursor-pointer btn-tactile"
              >
                <Focus className="w-3.5 h-3.5" />
                <span>View in 3D</span>
              </button>
              <button
                type="button"
                onClick={() => handleCheckClearance()}
                className="h-8 px-2.5 rounded-lg bg-[#151A20] hover:bg-white/[0.06] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer btn-tactile"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Check</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. SAFE State */}
        {statusState === 'SAFE' && safeData && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 animate-in fade-in duration-150 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CLEARANCE VERIFIED · NO CONFLICT</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAFE TO REGISTER
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              Proposed underground vector satisfies all statutory 3D clearance thresholds and is free of overlap.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-md bg-[#090B0E]/90 border border-emerald-500/20 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase">Min Measured Distance</span>
                <span className="font-bold text-emerald-400 text-sm">{safeData.min_distance_meters || safeData.minimum_distance_m || 2.84} m</span>
              </div>
              <div className="p-2 rounded-md bg-[#090B0E]/90 border border-emerald-500/20 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase">Required Clearance</span>
                <span className="font-bold text-slate-200 text-sm">{safeData.required_clearance_m || safetyClearance} m</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegisterPipeline}
              className="w-full h-8.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_12px_rgba(16,185,129,0.35)] cursor-pointer btn-tactile"
            >
              <span>Commit & Generate 3D ULPIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4. SUCCESS State */}
        {statusState === 'SUCCESS' && successResult && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in duration-150 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Asset Registered in Cadastre</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Assigned permanent 3D ULPIN and rendered live into the spatial database.
            </p>
            <div className="p-2.5 rounded-md bg-[#090B0E]/90 border border-emerald-500/20 font-mono text-[11px]">
              <div className="text-[9px] uppercase font-bold text-emerald-400">Assigned 3D ULPIN</div>
              <div className="font-bold text-slate-100 truncate">{successResult.ulpin}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusState('IDLE');
                setSuccessResult(null);
              }}
              className="w-full py-1.5 rounded-lg bg-[#151A20] hover:bg-white/[0.06] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer btn-tactile"
            >
              Register Another Asset
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Error:</strong> {errorMsg}
            </div>
          </div>
        )}

        {/* Pipeline / Infrastructure Form */}
        {assetCategory === 'pipeline' ? (
          <form onSubmit={handleRegisterPipeline} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Asset Description / Name</label>
              <input
                type="text"
                required
                value={pipeName}
                onChange={(e) => {
                  setPipeName(e.target.value);
                  if (statusState !== 'IDLE') setStatusState('IDLE');
                }}
                className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 text-xs"
                placeholder="e.g. West Distribution Water Trunk"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Classification</label>
                <select
                  value={pipeType}
                  onChange={(e) => {
                    setPipeType(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2 rounded-md cadastre-input text-slate-200 font-medium text-xs"
                >
                  <option value="water_pipe">Water Pipeline</option>
                  <option value="electric_cable">Power Cable</option>
                  <option value="fiber_cable">Fiber Conduit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Alignment Direction</label>
                <select
                  value={direction}
                  onChange={(e) => {
                    setDirection(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2 rounded-md cadastre-input text-slate-200 font-medium text-xs"
                >
                  <option value="SOUTH">SOUTH (180°)</option>
                  <option value="EAST">EAST (90°)</option>
                  <option value="WEST">WEST (270°)</option>
                  <option value="NORTH">NORTH (0°)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Start Latitude</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={startLat}
                  onChange={(e) => {
                    setStartLat(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Start Longitude</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={startLon}
                  onChange={(e) => {
                    setStartLon(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Depth (m, negative)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={startDepth}
                  onChange={(e) => {
                    setStartDepth(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-amber-400 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Length (meters)</label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  required
                  value={length}
                  onChange={(e) => {
                    setLength(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Safety Clearance (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={safetyClearance}
                  onChange={(e) => {
                    setSafetyClearance(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Pipe Radius (m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={proposedRadius}
                  onChange={(e) => {
                    setProposedRadius(e.target.value);
                    if (statusState !== 'IDLE') setStatusState('IDLE');
                  }}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Custodial Agency</label>
              <input
                type="text"
                required
                value={ownerAgency}
                onChange={(e) => setOwnerAgency(e.target.value)}
                className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 text-xs"
              />
            </div>

            <div className="p-2.5 rounded-md bg-[#090B0E]/80 border border-white/[0.08] flex items-start gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>Registration requires 3D spatial clearance check against all underground utilities.</span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleCheckClearance()}
                disabled={statusState === 'CHECKING'}
                className="w-full h-8 rounded-lg bg-[#151A20] hover:bg-white/[0.06] text-slate-200 font-semibold text-xs border border-white/[0.08] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 btn-tactile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statusState === 'CHECKING' ? 'animate-spin text-sky-400' : ''}`} />
                <span>{statusState === 'CONFLICT' ? 'Re-Evaluate Clearance' : 'Check Spatial Clearance'}</span>
              </button>

              <button
                type="submit"
                disabled={statusState === 'CHECKING'}
                className="w-full h-8.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_12px_rgba(14,165,233,0.35)] cursor-pointer disabled:opacity-50 btn-tactile"
              >
                <span>Generate 3D ULPIN & Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Building / Property Registration Form */
          <form onSubmit={handleRegisterProperty} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Building / Parcel Name</label>
              <input
                type="text"
                required
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 text-xs"
                placeholder="e.g. Navrang Commercial Tower"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={propLat}
                  onChange={(e) => setPropLat(e.target.value)}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={propLon}
                  onChange={(e) => setPropLon(e.target.value)}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Total Height (m)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={propHeight}
                  onChange={(e) => setPropHeight(e.target.value)}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Number of Floors</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={numFloors}
                  onChange={(e) => setNumFloors(e.target.value)}
                  className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] text-slate-400 font-medium mb-1">Owner / Development Agency</label>
              <input
                type="text"
                required
                value={ownerAgency}
                onChange={(e) => setOwnerAgency(e.target.value)}
                className="w-full h-7.5 px-2.5 rounded-md cadastre-input text-slate-100 text-xs"
              />
            </div>

            <div className="p-2.5 rounded-md bg-[#090B0E]/80 border border-white/[0.08] flex items-start gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>Generates discrete 3D volumetric parcels for all {numFloors} vertical floor units.</span>
            </div>

            <button
              type="submit"
              disabled={statusState === 'CHECKING'}
              className="w-full h-8.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_12px_rgba(14,165,233,0.35)] cursor-pointer disabled:opacity-50 btn-tactile"
            >
              <span>{statusState === 'CHECKING' ? 'Generating Units...' : 'Register Building & Sub-Parcels'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
