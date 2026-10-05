0# 3D ULPIN Generation & Vertical Property Mapping MVP

An interactive, presentation-ready 3D GIS prototype built for college-level hackathons based on the **Smart India Hackathon (SIH)** problem statement:

> **"3D ULPIN Generation and Vertical Property Mapping"**

This project demonstrates how **3D Spatial Identification (3D ULPIN)** can represent vertically separated property units (building floors/apartments) and subsurface linear infrastructure networks (water pipelines, electrical cables, fiber optics), enabling interactive 3D visualization and deterministic spatial conflict detection.

---

## 🌟 Key Highlights & Features

1. **Volumetric Vertical Cadastre (Multi-Story Buildings)**:
   - Represents buildings broken down into individually selectable vertical floor units (e.g. `3D-ULPIN-GJ-AHM-FLR-A01` to `FLR-A03`).
   - Clicking a floor displays property metadata: 3D ULPIN, Floor Number, Elevation, Height, Area (sqm), Footprint, and Lat/Lon.

2. **Single Identity for Linear Infrastructure Networks**:
   - Long underground pipelines receive **ONE unique 3D ULPIN** for the entire asset (e.g., `3D-ULPIN-GJ-AHM-WAT-001`).
   - Stores continuous 3D line vector geometry $(\text{Start}_X, \text{Start}_Y, \text{Start}_Z) \to (\text{End}_X, \text{End}_Y, \text{End}_Z)$.
   - Clicking **anywhere** along the 3D pipeline selects the single pipeline identity while dynamically calculating the local clicked point $(X, Y, Z)$ and Lat/Lon/Depth.

3. **Real-Time Live Asset Addition (WOW Demo Feature)**:
   - Live registration form for properties and underground utilities.
   - Generates deterministic prototype 3D ULPINs, calculates 3D line geometry, stores in SQLite, and **immediately injects into the 3D map without page refresh**.
   - Smoothly animates camera focus, applies a glowing highlight pulse, and displays a success notification.

4. **Deterministic 3D Spatial Conflict Detection (No AI/ML)**:
   - Uses pure 3D geometry algorithms (line segment to line segment shortest 3D distance and box bounds).
   - Detects subterranean pipe intersections or unsafe clearances ($< 1.2\text{m}$).
   - Generates `⚠️ SPATIAL CONFLICT DETECTED` hazard cards with a **"Zoom 3D Camera to Conflict"** action button.
   - Adjusting proposed route depth (e.g., from $-3.5\text{m}$ to $-7.0\text{m}$) resolves the clash immediately (`✓ NO SPATIAL CONFLICT`).

5. **Subsurface Controls**:
   - **Underground View Toggle**: Makes ground surface translucent to reveal subterranean networks.
   - **Visual Vertical Exaggeration Slider (1x–4x)**: Scales vertical visual spacing ($Y$) for presentation clarity while preserving true metric depth values in metadata displays.
   - **Cross-Section Inspection Mode**: Displays vertical subsurface layer planes (-3.5m water, -4.5m power, -6.0m deep utilities).

---

## 🏗️ System Architecture

```
                    +------------------------------------+
                    |          React 18 + Vite           |
                    |   (Three.js / React Three Fiber)   |
                    +------------------------------------+
                                      |           ^
                       REST / JSON    |           | Instant 3D Update
                                      v           |
                    +------------------------------------+
                    |       Python FastAPI Backend       |
                    |  - 3D Geometry & Vector Math       |
                    |  - Deterministic 3D ULPIN Engine   |
                    |  - 3D Line Segment Distance Engine |
                    +------------------------------------+
                                      |
                              SQLite Database
                       (properties & infrastructure)
```

---

## 📁 Folder Structure

```
3d/
├── backend/
│   ├── main.py              # FastAPI REST endpoints & CORS app
│   ├── database.py          # SQLite database schema & CRUD helpers
│   ├── models.py            # Pydantic request/response schemas
│   ├── geometry.py          # 3D vector math, segment distance, coordinate transforms
│   ├── ulpin_generator.py   # Deterministic 3D ULPIN hash generator
│   ├── seed_data.py         # Fictional Ahmedabad urban plot seed data
│   ├── requirements.txt     # Python dependencies (fastapi, uvicorn, pydantic)
│   └── ulpin_spatial.db     # SQLite database file
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── 3d/
    │   │   │   ├── SceneContainer.jsx        # Canvas, lighting, camera lerp
    │   │   │   ├── Building3D.jsx            # 3D buildings & stacked floor boxes
    │   │   │   ├── Pipeline3D.jsx            # 3D linear pipes & raycast click logic
    │   │   │   ├── GroundGrid.jsx            # Ground surface & depth layer planes
    │   │   │   └── ConflictMarker3D.jsx      # 3D hazard warning sphere & beacon
    │   │   └── ui/
    │   │       ├── Header.jsx                # Search bar & reset demo controls
    │   │       ├── SidebarNav.jsx            # View tab switcher
    │   │       ├── VisualControlsPanel.jsx   # Floating view toggles & exaggeration slider
    │   │       ├── AssetDetailsModal.jsx     # Selected asset & raycast point drawer
    │   │       ├── RegisterAssetModal.jsx    # Real-time asset creation form
    │   │       ├── ConflictDetectorPanel.jsx # Proposed route & conflict evaluation UI
    │   │       ├── DashboardView.jsx         # Live database metrics dashboard
    │   │       └── BeforeAfterView.jsx       # 2D flat GIS vs 3D ULPIN presentation guide
    │   ├── services/
    │   │   └── api.js                        # REST API client & Lat/Lon math
    │   ├── App.jsx                           # Main application state orchestrator
    │   ├── main.jsx                          # React DOM entry point
    │   └── index.css                         # Tailwind CSS v4 & glassmorphism utilities
    ├── index.html                            # HTML entry point with Google Fonts
    ├── vite.config.js                        # Vite config with API proxy & Tailwind plugin
    └── package.json                          # NPM dependencies
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 1. Start FastAPI Backend
Open a terminal in `backend/`:

```bash
cd backend
python -m pip install -r requirements.txt
python seed_data.py
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be running on `http://127.0.0.1:8000`.

### 2. Start Vite Frontend
Open a second terminal in `frontend/`:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```

Open your browser at `http://127.0.0.1:3000`.

---

## 🔬 Core Technical Implementations

### 1. Prototype 3D ULPIN Generation
Format: `3D-ULPIN-GJ-AHM-[TYPE]-[HASH]`
- Example: `3D-ULPIN-GJ-AHM-WAT-8F2A91` (Water Pipe), `3D-ULPIN-GJ-AHM-FLR-A02` (Floor 2)
- Generated deterministically by hashing asset category, type, reference Lat/Lon, elevation/depth, and timestamp using SHA-256.

### 2. Pipeline Geometry & Raycasting
Linear infrastructure assets store continuous 3D line coordinates from Start to End:
$$\theta = \text{radians}(\text{direction\_heading})$$
$$X_{end} = X_{start} + \text{Length} \times \sin(\theta)$$
$$Z_{end} = Z_{start} - \text{Length} \times \cos(\theta)$$

Clicking any 3D tube uses Three.js Raycasting to calculate exact intersection point $(P_x, P_y, P_z)$, displaying the single pipeline identity along with the specific clicked spatial position.

### 3. Deterministic 3D Conflict Detection Engine
The backend calculates the minimum 3D distance $d_{min}$ between the proposed line segment $S_1(t)$ and existing line segment $S_2(s)$:
$$S_1(t) = P_0 + t(P_1 - P_0), \quad t \in [0, 1]$$
$$S_2(s) = Q_0 + s(Q_1 - Q_0), \quad s \in [0, 1]$$

If $d_{min} < (R_1 + R_2 + \text{safety\_clearance})$, a spatial conflict is returned with exact conflict coordinates $(C_x, C_y, C_z)$.

---

## 🎬 12-Step Live Demonstration Script

Follow this sequence during your hackathon presentation:

1. **STEP 1 - Dashboard Overview**: Open the **Dashboard** tab to show live database metrics (Properties Registered, Infrastructure Lines, 3D ULPINs Generated).
2. **STEP 2 - 3D Map View**: Switch to the **3D Spatial Map** tab showing the fictional Ahmedabad urban plot.
3. **STEP 3 - Multi-Story Buildings**: Rotate and zoom to inspect Building A (3 floors), Building B (5 floors), and Building C (8 floors).
4. **STEP 4 - Underground View**: Click the **Underground View** toggle to make ground translucent, exposing underground water, electric, and fiber utility networks.
5. **STEP 5 - Vertical Exaggeration**: Adjust the **Vertical Exaggeration** slider from `1.0x` to `3.0x` to visually expand depth spacing for close underground pipes.
6. **STEP 6 - Floor Selection**: Click Floor 3 of Building B to view its prototype 3D ULPIN (`3D-ULPIN-GJ-AHM-FLR-B03`), elevation, height, and area.
7. **STEP 7 - Pipeline Identity Test**: Click near the start of Water Pipe 1 (`3D-ULPIN-GJ-AHM-WAT-001`), note the ULPIN and clicked position. Click near the end—the ULPIN remains identical, but clicked position updates.
8. **STEP 8 - Register Asset Form**: Open **Register Asset** tab. Enter a new pipeline: Start Depth `-4.0m`, Length `45m`, Direction `EAST`.
9. **STEP 9 - Click "Generate 3D ULPIN"**: Click the button to process.
10. **STEP 10 - Live Zero-Reload Injection**: Observe the new pipeline instantly render in 3D with camera focus, glowing pulse, and success toast without refreshing the page!
11. **STEP 11 - Conflict Detection**: Open **Conflict Engine** tab and click **"Simulate Conflict"** (Depth -3.5m). View `⚠️ SPATIAL CONFLICT DETECTED` card and click **"Zoom 3D Camera to Conflict"** to focus on the 3D hazard beacon.
12. **STEP 12 - Conflict Resolution**: Click **"Resolve Route"** (Shift Depth to -7.0m). Watch the system instantly confirm `✓ NO SPATIAL CONFLICT`.

---

## 📝 License
Built for educational and hackathon presentation purposes. Inspired by the Smart India Hackathon (SIH) 3D ULPIN problem statement.
