import React, { useEffect, useState, useMemo } from 'react';
import { Database, Table, Layers, ShieldCheck, Building2, Cable, Search, Copy, Check } from 'lucide-react';
import { fetchStatsApi, fetchAssets } from '../../services/api';

export function DashboardView() {
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [copiedUlpin, setCopiedUlpin] = useState(null);

  useEffect(() => {
    Promise.all([fetchStatsApi(), fetchAssets()])
      .then(([statsData, assetsData]) => {
        setStats(statsData);
        setAssets(assetsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCopy = (ulpin) => {
    navigator.clipboard.writeText(ulpin);
    setCopiedUlpin(ulpin);
    setTimeout(() => setCopiedUlpin(null), 2000);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.owner_agency && a.owner_agency.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory =
        filterCategory === 'all' ||
        (filterCategory === 'property' && (a.category === 'property' || a.asset_type === 'building' || a.asset_type === 'floor')) ||
        (filterCategory === 'infrastructure' && a.category === 'infrastructure');

      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, filterCategory]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 cadastre-panel rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-[#171C22] border border-white/[0.08] flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.2)]">
          <Database className="w-5 h-5 animate-spin text-sky-400" />
        </div>
        <span className="text-xs font-semibold text-slate-300 font-mono">Loading spatial cadastre database...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 text-slate-200 cadastre-panel rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden select-none bg-tech-grid">
      {/* Top Title & Header Bar */}
      <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              Spatial Registry & Volumetric Inventory
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
              Live SQLite DB
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            Official cadastral registry of vertical property sub-parcels and continuous subterranean utility corridors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3 py-1 rounded-lg bg-[#090B0E]/80 border border-white/[0.08] text-[11px] font-mono text-slate-400">
            Datum: <span className="text-sky-400 font-semibold">EPSG:3857 · WGS84</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 py-3 text-xs">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl cadastre-card flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
              Vertical Properties
            </span>
            <div className="w-6.5 h-6.5 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shadow-[0_0_8px_rgba(14,165,233,0.2)]">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
              {stats?.total_properties || 19}
            </div>
            <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
              {stats?.total_buildings || 3} Buildings · {stats?.total_floors || 16} Floor Parcels
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-xl cadastre-card flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
              Subsurface Utilities
            </span>
            <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <Cable className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
              {stats?.total_infrastructure || 7}
            </div>
            <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
              {stats?.water_pipelines_count || 3} Water · {stats?.electric_cables_count || 2} Power · {stats?.fiber_cables_count || 2} Fiber
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-xl cadastre-card flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
              3D ULPINs Assigned
            </span>
            <div className="w-6.5 h-6.5 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.2)]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
              {stats?.ulpins_generated || 26}
            </div>
            <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
              Unique Volumetric Identifiers
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-xl cadastre-card flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
              Clearance Audits
            </span>
            <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
              {stats?.conflicts_detected || 1}
            </div>
            <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
              Subterranean Clearance Analyzed
            </div>
          </div>
        </div>
      </div>

      {/* Directory Table Area */}
      <div className="flex-1 min-h-0 flex flex-col rounded-xl cadastre-card p-3 sm:p-4 overflow-hidden mt-1">
        {/* Table Controls */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-bold text-slate-100 tracking-tight">
              Statutory Cadastral Records ({filteredAssets.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-48 h-7.5 pl-8 pr-2.5 rounded-md cadastre-input text-xs text-slate-200 placeholder-slate-500 font-mono"
              />
            </div>

            {/* Category filter */}
            <div className="flex bg-[#090B0E]/80 p-0.5 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer btn-tactile ${
                  filterCategory === 'all' ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.35)]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterCategory('property')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer btn-tactile ${
                  filterCategory === 'property' ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.35)]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setFilterCategory('infrastructure')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer btn-tactile ${
                  filterCategory === 'infrastructure' ? 'bg-sky-500 text-white shadow-[0_1px_8px_rgba(14,165,233,0.35)]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Utilities
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#171C22] z-10">
              <tr className="border-b border-white/[0.08] text-[9.5px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Asset Description</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">3D ULPIN</th>
                <th className="py-2.5 px-3">Depth / Elevation</th>
                <th className="py-2.5 px-3">Length / Height</th>
                <th className="py-2.5 px-3">Custodial Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs text-slate-300">
              {filteredAssets.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-2">
                    {a.category === 'infrastructure' ? (
                      <Cable className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate max-w-[200px]">{a.name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-white/[0.04] border border-white/[0.06] text-slate-300">
                      {a.asset_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-400 font-bold">{a.ulpin}</span>
                      <button
                        onClick={() => handleCopy(a.ulpin)}
                        className="p-1 rounded hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 transition-colors btn-tactile cursor-pointer"
                        title="Copy ULPIN"
                      >
                        {copiedUlpin === a.ulpin ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {a.category === 'infrastructure' ? (
                      <span className="text-amber-400 font-bold">{a.depth}m depth</span>
                    ) : (
                      <span className="text-slate-100 font-bold">+{a.elevation}m elev</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300 font-medium">
                    {a.category === 'infrastructure' ? `${a.length}m` : `${a.height}m`}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-[160px]">
                    {a.owner_agency || 'Municipal Cadastre'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
