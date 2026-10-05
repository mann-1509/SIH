import React, { useState, useEffect } from 'react';
import { Header } from './components/ui/Header';
import { SceneContainer } from './components/3d/SceneContainer';
import { VisualControlsPanel } from './components/ui/VisualControlsPanel';
import { AssetDetailsModal } from './components/ui/AssetDetailsModal';
import { RegisterAssetModal } from './components/ui/RegisterAssetModal';
import { ConflictDetectorPanel } from './components/ui/ConflictDetectorPanel';
import { DashboardView } from './components/ui/DashboardView';
import { BeforeAfterView } from './components/ui/BeforeAfterView';
import { fetchAssets, resetSeedApi } from './services/api';

const BASE_LAT = 23.0225;
const BASE_LON = 72.5714;
const LAT_TO_METERS = 110574.0;
const LON_TO_METERS = 102500.0;

export default function App() {
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('map');

  // Selection & 3D Spatial State
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [clickedInfo, setClickedInfo] = useState(null);

  // Viewport Visual Controls
  const [undergroundView, setUndergroundView] = useState(true);
  const [showPipeOverlay, setShowPipeOverlay] = useState(true);
  const [activeMapLevel, setActiveMapLevel] = useState('all'); // 'all' | 'surface' | 'underground'
  const [verticalExaggeration, setVerticalExaggeration] = useState(1.5);
  const [showCrossSection, setShowCrossSection] = useState(false);

  // Conflict State & Explicit Camera Focus Targets
  const [conflictResult, setConflictResult] = useState(null);
  const [focusPoint, setFocusPoint] = useState({ x: 0, y: 0, z: 0, distance: 45 });
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [newlyCreatedUlpin, setNewlyCreatedUlpin] = useState(null);

  const [isResetting, setIsResetting] = useState(false);

  const loadAssets = async () => {
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Calculate accurate 3D world target and camera distance for any asset
  const computeAssetTarget = (asset, clickData = null) => {
    let targetX = 0, targetY = 0, targetZ = 0;
    let distance = 22;

    if (clickData && clickData.worldX !== undefined) {
      targetX = clickData.worldX;
      targetY = clickData.worldY;
      targetZ = clickData.worldZ;
      distance = clickData.distance || 18;
    } else if (clickData && clickData.x !== undefined) {
      targetX = clickData.x;
      targetY = clickData.y * verticalExaggeration;
      targetZ = clickData.z;
      distance = clickData.distance || 18;
    } else if (asset.start_x !== undefined) {
      // Linear pipeline asset
      targetX = (asset.start_x + asset.end_x) / 2;
      targetY = ((asset.start_y + asset.end_y) / 2) * verticalExaggeration;
      targetZ = (asset.start_z + asset.end_z) / 2;
      distance = 20;
    } else if (asset.asset_type === 'floor') {
      // Individual floor unit
      const lon = asset.longitude || BASE_LON;
      const lat = asset.latitude || BASE_LAT;
      targetX = (lon - BASE_LON) * LON_TO_METERS;
      targetZ = -(lat - BASE_LAT) * LAT_TO_METERS;
      const flElev = asset.elevation || 0;
      const flHeight = asset.height || 3.8;
      targetY = (flElev + flHeight / 2) * verticalExaggeration;
      distance = 18;
    } else if (asset.latitude !== undefined) {
      // Multi-story building / property
      targetX = (asset.longitude - BASE_LON) * LON_TO_METERS;
      targetZ = -(asset.latitude - BASE_LAT) * LAT_TO_METERS;
      const bldHeight = asset.height || 16;
      targetY = (bldHeight / 2) * verticalExaggeration;
      distance = Math.max(28, bldHeight * 1.5);
    }

    return { x: targetX, y: targetY, z: targetZ, distance };
  };

  // Handle asset selection AND calculate smooth camera focus
  const handleSelectAsset = (asset, clickData = null) => {
    setSelectedAsset(asset);
    setClickedInfo(clickData);
    if (!asset) return;

    const target = computeAssetTarget(asset, clickData);
    setFocusPoint(target);
    setFocusTrigger(prev => prev + 1);
  };

  // Explicit Focus Action
  const handleFocusAsset = (asset, clickData = null) => {
    const target = computeAssetTarget(asset, clickData);
    setFocusPoint(target);
    setFocusTrigger(prev => prev + 1);
  };

  // Search Handler
  const handleSearchUlpin = (query) => {
    const found = assets.find(
      (a) => a.ulpin.toLowerCase() === query.toLowerCase() || a.ulpin.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setActiveTab('map');
      handleSelectAsset(found);
    } else {
      alert(`No cadastral record found matching ULPIN: "${query}"`);
    }
  };

  // Live Asset Registration Sync
  const handleAssetRegistered = (newAsset) => {
    loadAssets();
    setConflictResult(null);
    setNewlyCreatedUlpin(newAsset.ulpin);
    setActiveTab('map');
    handleSelectAsset(newAsset);

    if (newAsset.category === 'infrastructure') {
      setUndergroundView(true);
    }

    setTimeout(() => setNewlyCreatedUlpin(null), 3500);
  };

  // Explicit Zoom/Focus to Conflict Site
  const handleFocusConflict = (coords) => {
    setFocusPoint({
      x: coords.x,
      y: coords.y * verticalExaggeration,
      z: coords.z,
      distance: 16
    });
    setFocusTrigger(prev => prev + 1);
    setUndergroundView(true);
  };

  // View Conflict from Registration Modal
  const handleViewConflictFromRegistration = (conflictRes, coords) => {
    setConflictResult(conflictRes);
    if (coords) {
      handleFocusConflict(coords);
    }
  };

  // Inspect conflict directly from 3D tag or conflicted entity
  const handleSelectConflict = (conflictItem) => {
    setActiveTab('conflict');
    if (conflictItem && conflictItem.conflict_x !== undefined) {
      handleFocusConflict({
        x: conflictItem.conflict_x,
        y: conflictItem.conflict_y,
        z: conflictItem.conflict_z
      });
    }
  };

  // Reset Demo Data
  const handleResetSeed = async () => {
    setIsResetting(true);
    try {
      await resetSeedApi();
      await loadAssets();
      setSelectedAsset(null);
      setClickedInfo(null);
      setConflictResult(null);
      setFocusPoint({ x: 0, y: 0, z: 0, distance: 45 });
      setFocusTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const isMapActive = activeTab === 'map' || activeTab === 'register' || activeTab === 'conflict';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090B0E] text-slate-100 flex flex-col antialiased select-none">
      {/* Top Application Bar */}
      <Header
        onSearch={handleSearchUlpin}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-2 sm:p-2.5 flex flex-col overflow-hidden relative">
        {isMapActive && (
          <div className="w-full h-full flex-1 min-h-0 relative rounded-xl overflow-hidden border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-[#090B0E] isolate z-10 flex flex-col">
            {/* Viewport Context Chip */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg cadastre-panel text-[11px] text-slate-300 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">3D Volumetric Cadastre</span>
              <span className="text-slate-400 font-mono">· Ahmedabad Sector 3</span>
            </div>

            {/* 3D WebGL Canvas */}
            <SceneContainer
              assets={assets}
              selectedAsset={selectedAsset}
              onSelectAsset={handleSelectAsset}
              undergroundView={undergroundView}
              showPipeOverlay={showPipeOverlay}
              verticalExaggeration={verticalExaggeration}
              showCrossSection={showCrossSection}
              conflictResult={conflictResult}
              onSelectConflict={handleSelectConflict}
              focusPoint={focusPoint}
              focusTrigger={focusTrigger}
              newlyCreatedUlpin={newlyCreatedUlpin}
              isMapActive={isMapActive}
              activeTab={activeTab}
            />

            {/* Floating Map Controls HUD */}
            <VisualControlsPanel
              undergroundView={undergroundView}
              setUndergroundView={setUndergroundView}
              showPipeOverlay={showPipeOverlay}
              setShowPipeOverlay={setShowPipeOverlay}
              activeMapLevel={activeMapLevel}
              setActiveMapLevel={setActiveMapLevel}
              verticalExaggeration={verticalExaggeration}
              setVerticalExaggeration={setVerticalExaggeration}
              showCrossSection={showCrossSection}
              setShowCrossSection={setShowCrossSection}
              onResetCamera={() => {
                setFocusPoint({ x: 0, y: 0, z: 0, distance: 45 });
                setFocusTrigger(prev => prev + 1);
              }}
            />

            {/* Selected Asset Details Drawer */}
            {selectedAsset && activeTab === 'map' && (
              <AssetDetailsModal
                asset={selectedAsset}
                clickedInfo={clickedInfo}
                onClose={() => {
                  setSelectedAsset(null);
                  setClickedInfo(null);
                }}
                onFocusAsset={handleFocusAsset}
              />
            )}

            {/* Register Asset Panel Overlay */}
            {activeTab === 'register' && (
              <RegisterAssetModal
                onAssetRegistered={handleAssetRegistered}
                onClose={() => {
                  setActiveTab('map');
                  setConflictResult(null);
                }}
                onViewConflictIn3D={handleViewConflictFromRegistration}
              />
            )}

            {/* Conflict Analysis Panel Overlay */}
            {activeTab === 'conflict' && (
              <ConflictDetectorPanel
                onConflictChecked={(res) => setConflictResult(res)}
                onZoomToConflict={handleFocusConflict}
                onClose={() => {
                  setActiveTab('map');
                  setConflictResult(null);
                }}
              />
            )}
          </div>
        )}

        {/* Full-View Cadastre Modules */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'before_after' && <BeforeAfterView />}
      </main>
    </div>
  );
}
