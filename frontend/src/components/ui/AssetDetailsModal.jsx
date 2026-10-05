import React, { useState } from 'react';
import { X, Copy, Check, MapPin, CornerDownRight, Focus, ShieldCheck, Building2, Cable, Layers } from 'lucide-react';

export function AssetDetailsModal({ asset, clickedInfo, onClose, onFocusAsset }) {
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPipeline = asset.category === 'infrastructure';
  const isFloor = asset.asset_type === 'floor';

  return (
    <div className="absolute top-4 right-4 z-40 w-[390px] max-w-[calc(100vw-2rem)] max-h-[calc(100%-2rem)] flex flex-col cadastre-panel rounded-xl overflow-hidden text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200 select-none">
      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#151A20]/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7.5 h-7.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            {isPipeline ? (
              <Cable className="w-4 h-4" />
            ) : isFloor ? (
              <Layers className="w-4 h-4" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9.5px] uppercase font-mono font-semibold tracking-wider text-sky-400 block truncate">
              {asset.category} · {asset.asset_type.replace('_', ' ')}
            </span>
            <h3 className="font-bold text-xs text-slate-100 truncate tracking-tight">
              {asset.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onFocusAsset(asset, clickedInfo)}
            className="h-7 px-2.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_8px_rgba(14,165,233,0.35)] cursor-pointer btn-tactile"
            title="Focus camera on 3D coordinates"
          >
            <Focus className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {/* Assigned 3D ULPIN Pill Box */}
        <div className="p-3 rounded-lg cadastre-card space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-mono font-medium text-slate-400 tracking-wider">
              Assigned 3D ULPIN
            </span>
            <button
              onClick={handleCopy}
              className="h-5 px-2 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer btn-tactile"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-[11.5px] font-mono font-bold text-sky-400 tracking-tight break-all bg-[#090B0E]/90 p-2 rounded-md border border-sky-500/20 shadow-inner">
            {asset.ulpin}
          </div>
        </div>

        {/* Raycast Click Coordinate (If clicked on 3D utility line) */}
        {clickedInfo && isPipeline && (
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Raycast Surface Probe</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
              <div className="bg-[#090B0E]/80 p-1.5 rounded text-center border border-white/[0.06]">
                <div className="text-[9px] text-slate-400 uppercase">Lat</div>
                <div className="text-slate-100 font-bold">{clickedInfo.lat}</div>
              </div>
              <div className="bg-[#090B0E]/80 p-1.5 rounded text-center border border-white/[0.06]">
                <div className="text-[9px] text-slate-400 uppercase">Lon</div>
                <div className="text-slate-100 font-bold">{clickedInfo.lon}</div>
              </div>
              <div className="bg-[#090B0E]/80 p-1.5 rounded text-center border border-white/[0.06]">
                <div className="text-[9px] text-slate-400 uppercase">Depth</div>
                <div className="text-amber-400 font-bold">{clickedInfo.depth}m</div>
              </div>
            </div>
          </div>
        )}

        {/* Core Spatial Metric Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg cadastre-card">
            <div className="text-[10px] text-slate-400 font-medium">Category</div>
            <div className="font-semibold text-slate-200 capitalize mt-0.5">{asset.category}</div>
          </div>
          <div className="p-2.5 rounded-lg cadastre-card">
            <div className="text-[10px] text-slate-400 font-medium">Asset Type</div>
            <div className="font-semibold text-slate-200 capitalize mt-0.5">{asset.asset_type.replace('_', ' ')}</div>
          </div>

          {isPipeline ? (
            <>
              <div className="p-2.5 rounded-lg cadastre-card">
                <div className="text-[10px] text-slate-400 font-medium">Subsurface Depth</div>
                <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">{asset.depth} m</div>
              </div>
              <div className="p-2.5 rounded-lg cadastre-card">
                <div className="text-[10px] text-slate-400 font-medium">Total Length</div>
                <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">{asset.length} m</div>
              </div>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-lg cadastre-card">
                <div className="text-[10px] text-slate-400 font-medium">Elevation</div>
                <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">+{asset.elevation || 0}m</div>
              </div>
              <div className="p-2.5 rounded-lg cadastre-card">
                <div className="text-[10px] text-slate-400 font-medium">
                  {isFloor ? 'Floor Level' : 'Total Height'}
                </div>
                <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">
                  {isFloor ? `Floor ${asset.floor_number}` : `${asset.height}m`}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Spatial Geo-Bounds Card */}
        <div className="p-3 rounded-lg cadastre-card space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Spatial Geo-Bounds</span>
          </div>

          {isPipeline ? (
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between bg-[#090B0E]/80 px-2.5 py-1.5 rounded-md border border-white/[0.06]">
                <span>Start Point:</span>
                <span className="text-slate-200 font-semibold">{asset.start_lat}, {asset.start_lon}</span>
              </div>
              <div className="flex justify-between bg-[#090B0E]/80 px-2.5 py-1.5 rounded-md border border-white/[0.06]">
                <span>End Point:</span>
                <span className="text-slate-200 font-semibold">{asset.end_lat}, {asset.end_lon}</span>
              </div>
              <div className="flex justify-between bg-[#090B0E]/80 px-2.5 py-1.5 rounded-md border border-white/[0.06]">
                <span>Heading:</span>
                <span className="text-slate-200 font-semibold">{asset.direction_deg}°</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between bg-[#090B0E]/80 px-2.5 py-1.5 rounded-md border border-white/[0.06]">
                <span>Center Lat/Lon:</span>
                <span className="text-slate-200 font-semibold">{asset.latitude}, {asset.longitude}</span>
              </div>
              <div className="flex justify-between bg-[#090B0E]/80 px-2.5 py-1.5 rounded-md border border-white/[0.06]">
                <span>Footprint:</span>
                <span className="text-slate-200 font-semibold">{asset.length}m × {asset.width}m</span>
              </div>
            </div>
          )}
        </div>

        {/* Custodial Agency & Statutory Notice */}
        <div className="p-3 rounded-lg cadastre-card space-y-1.5">
          <div className="text-[9.5px] uppercase font-mono font-medium text-slate-400">
            Custodial Authority
          </div>
          <div className="text-xs font-semibold text-slate-100">
            {asset.owner_agency || 'Ahmedabad Municipal Corporation'}
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Statutory Volumetric Parcel Record</span>
          </div>
        </div>

        {/* Metadata Specs */}
        {asset.metadata && Object.keys(asset.metadata).length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[9.5px] uppercase font-mono font-medium text-slate-400">
              Asset Attributes
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(asset.metadata).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#12161B] text-slate-300 border border-white/[0.08]"
                >
                  <strong className="text-slate-400 font-normal">{k}:</strong> {String(v)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
