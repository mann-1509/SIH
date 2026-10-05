from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from database import init_db, get_all_assets, get_asset_by_ulpin_or_id, insert_asset
from models import PipelineCreateRequest, PropertyCreateRequest, ConflictCheckRequest
from geometry import (
    calculate_pipeline_endpoint,
    latlon_to_local_xy,
    local_xy_to_latlon,
    check_3d_conflict,
    evaluate_all_conflicts
)
from ulpin_generator import generate_3d_ulpin
from seed_data import seed_database

app = FastAPI(
    title="3D ULPIN & Spatial Property Mapping API",
    description="Backend API for 3D ULPIN generation, vertical property mapping, and 3D spatial conflict detection.",
    version="1.0.0"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    # Check if empty, if so, seed
    assets = get_all_assets()
    if not assets:
        seed_database()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "3D ULPIN Generation and Vertical Property Mapping API",
        "version": "1.0.0"
    }

@app.get("/api/assets")
def get_assets():
    """Retrieve all spatial property and infrastructure assets."""
    return get_all_assets()

@app.get("/api/assets/{ulpin_or_id}")
def get_asset(ulpin_or_id: str):
    """Retrieve a single asset by 3D ULPIN or numeric ID."""
    asset = get_asset_by_ulpin_or_id(ulpin_or_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@app.post("/api/assets/register-pipeline")
def register_pipeline(req: PipelineCreateRequest):
    """
    Real-Time Pipeline Registration Endpoint with 3D Spatial Conflict Gate.
    Calculates 3D line geometry, validates spatial clearance against all assets,
    blocks registration if conflicts occur, otherwise generates 3D ULPIN and stores in SQLite.
    """
    calc = calculate_pipeline_endpoint(
        req.start_lat,
        req.start_lon,
        req.start_depth,
        req.length,
        req.direction,
        req.custom_angle,
        req.end_depth
    )
    
    proposed_p1 = [calc["start_x"], calc["start_y"], calc["start_z"]]
    proposed_p2 = [calc["end_x"], calc["end_y"], calc["end_z"]]
    
    # 1. 3D Spatial Conflict Detection Gate
    safety_clearance = req.safety_clearance if req.safety_clearance is not None else 1.2
    proposed_radius = req.proposed_radius if req.proposed_radius is not None else 0.35
    
    all_assets = get_all_assets()
    eval_result = evaluate_all_conflicts(
        proposed_p1,
        proposed_p2,
        proposed_radius,
        all_assets,
        safety_clearance=safety_clearance
    )
    
    if req.check_conflicts and eval_result["has_conflict"]:
        first_conflict = eval_result["conflicts"][0]
        return {
            "success": False,
            "safe": False,
            "conflict": True,
            "has_conflict": True,
            "conflict_detected": True,
            "status": "⚠️ SPATIAL CONFLICT DETECTED",
            "message": f"Registration blocked: Proposed asset conflicts with {len(eval_result['conflicts'])} existing underground utility asset(s).",
            "conflicts": eval_result["conflicts"],
            "conflicting_asset": first_conflict,
            "minimum_distance_m": first_conflict["minimum_distance_m"],
            "min_distance_meters": first_conflict["minimum_distance_m"],
            "required_clearance_m": first_conflict["required_clearance_m"],
            "conflict_point": {
                "x": first_conflict["conflict_x"],
                "y": first_conflict["conflict_y"],
                "z": first_conflict["conflict_z"]
            },
            "proposed_geometry": {
                "start": proposed_p1,
                "end": proposed_p2,
                "start_lat": req.start_lat,
                "start_lon": req.start_lon,
                "end_lat": calc["end_lat"],
                "end_lon": calc["end_lon"],
                "depth": req.start_depth,
                "length": req.length,
                "direction": req.direction
            }
        }
    
    # 2. No Spatial Conflict -> Generate Deterministic 3D ULPIN and Persist
    ulpin = generate_3d_ulpin(
        req.asset_type,
        "infrastructure",
        req.start_lat,
        req.start_lon,
        req.start_depth,
        req.name
    )
    
    asset_obj = {
        "ulpin": ulpin,
        "name": req.name,
        "asset_type": req.asset_type,
        "category": "infrastructure",
        "owner_agency": req.owner_agency,
        "latitude": req.start_lat,
        "longitude": req.start_lon,
        "elevation": 0.0,
        "depth": req.start_depth,
        "length": req.length,
        "width": 0.5,
        "height": 0.5,
        "direction_deg": calc["direction_deg"],
        "start_x": calc["start_x"],
        "start_y": calc["start_y"],
        "start_z": calc["start_z"],
        "end_x": calc["end_x"],
        "end_y": calc["end_y"],
        "end_z": calc["end_z"],
        "start_lat": req.start_lat,
        "start_lon": req.start_lon,
        "end_lat": calc["end_lat"],
        "end_lon": calc["end_lon"],
        "geometry": calc["geometry"],
        "metadata": req.metadata or {}
    }
    
    saved = insert_asset(asset_obj)
    return {
        "success": True,
        "safe": True,
        "conflict": False,
        "has_conflict": False,
        "conflict_detected": False,
        "status": "✓ NO SPATIAL CONFLICT",
        "message": "✓ NO SPATIAL CONFLICT. 3D ULPIN generated and asset safely registered in 3D spatial database.",
        "asset": saved,
        "ulpin": ulpin,
        "minimum_distance_m": eval_result["min_measured_distance_m"],
        "min_distance_meters": eval_result["min_measured_distance_m"],
        "required_clearance_m": safety_clearance,
        "proposed_geometry": {
            "start": proposed_p1,
            "end": proposed_p2,
            "start_lat": req.start_lat,
            "start_lon": req.start_lon,
            "end_lat": calc["end_lat"],
            "end_lon": calc["end_lon"],
            "depth": req.start_depth,
            "length": req.length,
            "direction": req.direction
        }
    }

@app.post("/api/assets/register-property")
def register_property(req: PropertyCreateRequest):
    """
    Registers a building property and automatically generates vertical floor 3D ULPINs.
    """
    bld_ulpin = generate_3d_ulpin(
        "building",
        "property",
        req.latitude,
        req.longitude,
        req.elevation,
        req.name
    )
    
    bld_obj = {
        "ulpin": bld_ulpin,
        "name": req.name,
        "asset_type": "building",
        "category": "property",
        "owner_agency": req.owner_agency,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "elevation": req.elevation,
        "length": req.length,
        "width": req.width,
        "height": req.height,
        "direction_deg": 0.0,
        "metadata": {
            "num_floors": req.num_floors,
            "address": req.address,
            "property_type": req.property_type
        }
    }
    
    bld_saved = insert_asset(bld_obj)
    bld_id = bld_saved["id"]
    
    created_floors = []
    num_floors = req.num_floors or 1
    floor_height = req.height / num_floors
    
    for i in range(1, num_floors + 1):
        fl_elev = req.elevation + (i - 1) * floor_height
        fl_ulpin = generate_3d_ulpin(
            "floor",
            "property",
            req.latitude,
            req.longitude,
            fl_elev,
            f"{req.name}_Floor_{i}"
        )
        
        fl_obj = {
            "ulpin": fl_ulpin,
            "name": f"{req.name} - Floor {i}",
            "asset_type": "floor",
            "category": "property",
            "owner_agency": req.owner_agency,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "elevation": fl_elev,
            "height": floor_height - 0.2,
            "length": req.length,
            "width": req.width,
            "floor_number": i,
            "parent_building_id": bld_id,
            "metadata": {
                "area_sqm": round(req.length * req.width, 2),
                "property_type": req.property_type
            }
        }
        fl_saved = insert_asset(fl_obj)
        created_floors.append(fl_saved)
        
    return {
        "success": True,
        "message": f"Building & {num_floors} vertical floor ULPINs generated successfully.",
        "building": bld_saved,
        "floors": created_floors
    }

@app.post("/api/conflict-check")
def conflict_check(req: ConflictCheckRequest):
    """
    Deterministic 3D Conflict Detection Engine.
    Compares proposed pipeline vector against all existing assets in database.
    """
    calc = calculate_pipeline_endpoint(
        req.start_lat,
        req.start_lon,
        req.start_depth,
        req.length,
        req.direction,
        req.custom_angle
    )
    
    proposed_p1 = [calc["start_x"], calc["start_y"], calc["start_z"]]
    proposed_p2 = [calc["end_x"], calc["end_y"], calc["end_z"]]
    
    safety_clearance = req.safety_clearance if req.safety_clearance is not None else 1.2
    proposed_radius = req.proposed_radius if req.proposed_radius is not None else 0.35
    
    all_assets = get_all_assets()
    eval_result = evaluate_all_conflicts(
        proposed_p1,
        proposed_p2,
        proposed_radius,
        all_assets,
        safety_clearance=safety_clearance
    )
    
    if eval_result["has_conflict"]:
        first_conflict = eval_result["conflicts"][0]
        return {
            "safe": False,
            "has_conflict": True,
            "conflict_detected": True,
            "conflict": True,
            "status": "⚠️ SPATIAL CONFLICT DETECTED",
            "message": f"Proposed route conflicts with {len(eval_result['conflicts'])} existing infrastructure asset(s).",
            "conflicts": eval_result["conflicts"],
            "conflicting_asset": first_conflict,
            "min_distance_meters": first_conflict["minimum_distance_m"],
            "minimum_distance_m": first_conflict["minimum_distance_m"],
            "required_clearance_m": first_conflict["required_clearance_m"],
            "conflict_point": {
                "x": first_conflict["conflict_x"],
                "y": first_conflict["conflict_y"],
                "z": first_conflict["conflict_z"]
            },
            "proposed_geometry": {
                "start": proposed_p1,
                "end": proposed_p2,
                "start_lat": req.start_lat,
                "start_lon": req.start_lon,
                "end_lat": calc["end_lat"],
                "end_lon": calc["end_lon"],
                "depth": req.start_depth,
                "length": req.length,
                "direction": req.direction
            }
        }
    else:
        return {
            "safe": True,
            "has_conflict": False,
            "conflict_detected": False,
            "conflict": False,
            "status": "✓ NO SPATIAL CONFLICT",
            "message": "Proposed underground route maintains safe spatial clearance from all existing assets.",
            "conflicts": [],
            "conflicting_asset": None,
            "min_distance_meters": eval_result["min_measured_distance_m"],
            "minimum_distance_m": eval_result["min_measured_distance_m"],
            "required_clearance_m": safety_clearance,
            "proposed_geometry": {
                "start": proposed_p1,
                "end": proposed_p2,
                "start_lat": req.start_lat,
                "start_lon": req.start_lon,
                "end_lat": calc["end_lat"],
                "end_lon": calc["end_lon"],
                "depth": req.start_depth,
                "length": req.length,
                "direction": req.direction
            }
        }

@app.get("/api/stats")
def get_stats():
    """Retrieve summary dashboard analytics."""
    assets = get_all_assets()
    
    buildings = [a for a in assets if a["asset_type"] == "building"]
    floors = [a for a in assets if a["asset_type"] == "floor"]
    infra = [a for a in assets if a["category"] == "infrastructure"]
    
    water_pipes = [a for a in assets if a["asset_type"] == "water_pipe"]
    elec_cables = [a for a in assets if a["asset_type"] == "electric_cable"]
    fiber_cables = [a for a in assets if a["asset_type"] == "fiber_cable"]
    
    return {
        "total_assets": len(assets),
        "total_properties": len(buildings) + len(floors),
        "total_buildings": len(buildings),
        "total_floors": len(floors),
        "total_infrastructure": len(infra),
        "water_pipelines_count": len(water_pipes),
        "electric_cables_count": len(elec_cables),
        "fiber_cables_count": len(fiber_cables),
        "ulpins_generated": len(assets),
        "conflicts_detected": 1 # Demo static count
    }

@app.post("/api/seed")
def reset_seed():
    """Re-seed database with default Ahmedabad demo dataset."""
    seed_database()
    return {"success": True, "message": "Database reset to initial demo state."}
