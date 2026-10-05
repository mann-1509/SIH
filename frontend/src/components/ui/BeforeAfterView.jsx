import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Layers,
  Box,
  MapPin,
  AlertTriangle,
  FileText,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Building2,
  Network
} from 'lucide-react';

export function BeforeAfterView() {
  const [activeSubTab, setActiveSubTab] = useState('side_by_side');

  return (
    <div className="w-full h-full flex flex-col min-h-0 text-slate-200 cadastre-panel rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden select-none bg-tech-grid">
      {/* Top Title & Subtab Navigation */}
      <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              2D Land Records vs 3D Volumetric ULPIN
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_8px_rgba(14,165,233,0.15)]">
              Comparative Analysis
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            Contrasting traditional flat parcel cadastre limitations with continuous volumetric spatial parcel identification.
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex bg-[#090B0E]/80 p-0.5 rounded-lg border border-white/[0.08] shrink-0">
          <button
            onClick={() => setActiveSubTab('side_by_side')}
            className={`h-7.5 px-3 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer btn-tactile ${
              activeSubTab === 'side_by_side'
                ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Side-by-Side Analysis
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`h-7.5 px-3 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer btn-tactile ${
              activeSubTab === 'matrix'
                ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Capability Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('workflow')}
            className={`h-7.5 px-3 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer btn-tactile ${
              activeSubTab === 'workflow'
                ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Operational Impact
          </button>
        </div>
      </div>

      {/* Scrollable Body Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-3 space-y-4">
        {/* SUB-VIEW 1: SIDE BY SIDE */}
        {activeSubTab === 'side_by_side' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* 2D FLAT CADASTRE CARD */}
              <div className="p-4.5 rounded-xl cadastre-card space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-transparent opacity-70" />
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs font-mono border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]">
                      2D
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-mono font-semibold text-slate-400 block tracking-wider">
                        Legacy Framework
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                        Conventional 2D Surface Cadastre
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Legacy Limitations
                  </span>
                </div>

                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#090B0E]/80 border border-white/[0.04]">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5 text-xs font-semibold">
                        2D Footprint Collision
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Multi-story apartments and basement levels collapse into an identical flat 2D polygon with no vertical segregation.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#090B0E]/80 border border-white/[0.04]">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5 text-xs font-semibold">
                        Zero Subsurface Depth Profiling
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Pipelines and power cables are recorded as flat 2D lines with zero depth vector (Z), risking severe excavation damage.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#090B0E]/80 border border-white/[0.04]">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5 text-xs font-semibold">
                        No Vertical Parcel Ownership ID
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Individual floor unit ownership relies on text descriptions (e.g. "Flat 302, 3rd Floor") without true 3D spatial boundaries.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D VOLUMETRIC ULPIN CARD */}
              <div className="p-4.5 rounded-xl cadastre-card space-y-3.5 border-sky-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.08)]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-emerald-400 to-transparent" />
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs font-mono border border-sky-500/30 shadow-[0_0_8px_rgba(14,165,233,0.2)]">
                      3D
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-mono font-semibold text-slate-400 block tracking-wider">
                        Standard Architecture
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                        3D Volumetric ULPIN Cadastre
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                    Proposed Solution
                  </span>
                </div>

                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#090B0E]/80 border border-sky-500/15">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5 text-xs font-semibold">
                        Discrete Vertical Floor ULPINs
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Every vertical floor unit receives a unique identifier (e.g. <code className="text-sky-400 font-mono font-semibold">3D-ULPIN-GJ-AHM-FLR-A01</code>) with exact volumetric bounds.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#090B0E]/80 border border-sky-500/15">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5 text-xs font-semibold">
                        Continuous 3D Line Vectors
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Subsurface infrastructure stores continuous 3D paths (Start XYZ to End XYZ), enabling raycast inspection anywhere along the asset.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#090B0E]/80 border border-sky-500/15">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5 text-xs font-semibold">
                        Deterministic Clearance Engine
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Computes exact 3D segment-to-segment clearance distances mathematically to flag underground utility clashes before digging.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Process Strip */}
            <div className="p-3.5 rounded-xl cadastre-card flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-200">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-200 text-[11.5px]">3D Spatial Geometry</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-[0_0_8px_rgba(14,165,233,0.2)]">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-100 text-[11.5px]">3D ULPIN Engine</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-200">
                  <Network className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-200 text-[11.5px]">Continuous 3D Vectors</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-200">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-200 text-[11.5px]">Volumetric Cadastre</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-emerald-400 text-[11.5px]">Clearance Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: TECHNICAL MATRIX */}
        {activeSubTab === 'matrix' && (
          <div className="p-4 rounded-xl cadastre-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
              <Layers className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-bold text-slate-100 tracking-tight">
                Technical Capability Matrix
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[9.5px] uppercase font-mono font-semibold text-slate-400 bg-[#090B0E]/80">
                    <th className="py-2.5 px-3">Capability Dimension</th>
                    <th className="py-2.5 px-3 text-rose-400">2D Conventional Cadastre</th>
                    <th className="py-2.5 px-3 text-sky-400">3D Volumetric ULPIN</th>
                    <th className="py-2.5 px-3">Institutional Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Vertical Multi-Story Registry</span>
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-medium">Single shared 2D polygon</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Discrete floor 3D ULPINs</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">Unambiguous legal title per vertical floor level</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                      <Network className="w-3.5 h-3.5 text-slate-400" />
                      <span>Subsurface Utility Mapping</span>
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-medium">Flat lines with zero depth info</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Full 3D vectors (X, Y, Z)</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">Continuous metric depth profiling along entire line</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Spatial Conflict Detection</span>
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-medium">Manual guesswork on site</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Deterministic clearance engine</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">Zero-guesswork hazard prevention prior to excavation</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Raycast Probe Inspection</span>
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-medium">Flat polygon click only</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Dynamic XYZ & Lat/Lon probe</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">Inspect exact depth & Lat/Lon at any clicked point</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>Live Ingestion & Sync</span>
                    </td>
                    <td className="py-3 px-3 text-rose-400 font-medium">Manual batch exports</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Live zero-reload 3D injection</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">Instant 3D rendering and camera focus</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: OPERATIONAL IMPACT */}
        {activeSubTab === 'workflow' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-xl cadastre-card space-y-2.5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 opacity-60" />
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-100 tracking-tight">
                Reduced Excavation Utility Strikes
              </h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                By recording exact metric depths (-3.5m, -4.5m, -6.0m), contractors know precise clearances before breaking ground, eliminating pipeline puncturing and costly utility shutdowns.
              </p>
            </div>

            <div className="p-4 rounded-xl cadastre-card space-y-2.5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-sky-500 opacity-60" />
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.15)]">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-100 tracking-tight">
                Volumetric Property Mortgages & Deeds
              </h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Financial institutions and municipal registrars can uniquely bind collateral and title deeds to discrete 3D ULPINs without ambiguity over which floor level is encumbered.
              </p>
            </div>

            <div className="p-4 rounded-xl cadastre-card space-y-2.5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 opacity-60" />
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-100 tracking-tight">
                Inter-Agency Cadastral Clearance
              </h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Enables municipal water, electricity, gas, and telecom departments to evaluate new subterranean alignments against a single shared 3D spatial database.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
