import React, { useState } from 'react';
import { Search, RefreshCw, Layers, Menu, X, Map, PlusCircle, AlertTriangle, Database, BarChart3, Radio } from 'lucide-react';

export function Header({
  onSearch,
  onResetSeed,
  isResetting,
  activeTab = 'map',
  setActiveTab = () => {}
}) {
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'map', label: '3D Spatial Map', icon: Map },
    { id: 'register', label: 'Register Asset', icon: PlusCircle },
    { id: 'conflict', label: 'Conflict Analysis', icon: AlertTriangle },
    { id: 'dashboard', label: 'Registry Inventory', icon: Database },
    { id: 'before_after', label: '2D vs 3D Benchmark', icon: BarChart3 },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0D1014]/95 backdrop-blur-xl border-b border-white/[0.08] select-none">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 h-13 flex items-center justify-between gap-3">
        {/* Left Region: Brand Identity & Zone Context */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="3D ULPIN Cadastre Home"
          >
            <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)] ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-[13px] text-slate-100 tracking-tight">3D ULPIN</span>
                <span className="text-[9px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  Cadastre
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                Ahmedabad Zone · Sec-03
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/[0.08] text-[11px] text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-300 font-medium">EPSG:3857</span>
            <span className="text-slate-500">· Live SQLite Spatial DB</span>
          </div>
        </div>

        {/* Center Region: Desktop Navigation Tabs */}
        <div className="hidden lg:flex flex-1 justify-center max-w-2xl px-2">
          <nav className="flex items-center gap-1 bg-[#12161B] p-1 rounded-lg border border-white/[0.07] shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-7.5 px-3 rounded-md text-[11.5px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer whitespace-nowrap btn-tactile ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-[0_2px_10px_rgba(14,165,233,0.35)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                  title={tab.label}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Region: Quick Search & Dataset Actions */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ULPIN ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-40 lg:w-52 h-7.5 pl-8 pr-8 rounded-md cadastre-input text-xs text-slate-200 placeholder-slate-500 focus:w-60 focus:border-sky-500 transition-all font-mono"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5.5 px-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-[10px] font-mono transition-colors cursor-pointer"
                title="Search"
              >
                ↵
              </button>
            </div>
          </form>

          {/* Reset Dataset Button */}
          <button
            onClick={onResetSeed}
            disabled={isResetting}
            className="h-7.5 px-2.5 sm:px-3 rounded-md bg-[#12161B] hover:bg-white/[0.06] border border-white/[0.08] hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 shrink-0 btn-tactile"
            title="Reset spatial database to default synthetic dataset"
          >
            <RefreshCw className={`w-3 h-3 text-slate-400 ${isResetting ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline text-[11px]">{isResetting ? 'Resetting...' : 'Reset Data'}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-7.5 h-7.5 rounded-md bg-[#12161B] border border-white/[0.08] text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#0D1014] p-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Search ULPIN ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-8.5 px-3 rounded-md cadastre-input text-xs text-slate-200 font-mono"
            />
            <button
              type="submit"
              className="h-8.5 px-3 rounded-md bg-sky-500 text-white text-xs font-semibold"
            >
              Search
            </button>
          </form>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full h-9 px-3 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
