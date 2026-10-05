import json
from database import clear_assets, insert_asset, init_db
from geometry import latlon_to_local_xy, local_xy_to_latlon, calculate_pipeline_endpoint

def seed_database():
    init_db()
    clear_assets()
    
    # 1. BUILDINGS
    buildings = [
        {
            "ulpin": "3D-ULPIN-GJ-AHM-BLD-001",
            "name": "Sabarmati Tech Hub (Building A)",
            "asset_type": "building",
            "category": "property",
            "owner_agency": "Gujarat IT Development Corp",
            "latitude": 23.02270,
            "longitude": 72.57110,
            "elevation": 0.0,
            "length": 16.0,
            "width": 12.0,
            "height": 12.0,
            "direction_deg": 0.0,
            "metadata": {"floors": 3, "address": "Plot 12, Ashram Road, Ahmedabad", "zone": "Commercial"}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-BLD-002",
            "name": "Navrang Residency (Building B)",
            "asset_type": "building",
            "category": "property",
            "owner_agency": "Navrang Cooperative Housing",
            "latitude": 23.02230,
            "longitude": 72.57170,
            "elevation": 0.0,
            "length": 22.0,
            "width": 16.0,
            "height": 20.0,
            "direction_deg": 0.0,
            "metadata": {"floors": 5, "address": "Plot 14, Navrangpura, Ahmedabad", "zone": "Mixed Residential"}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-BLD-003",
            "name": "Karnavati Trade Tower (Building C)",
            "asset_type": "building",
            "category": "property",
            "owner_agency": "Karnavati Commercial Estate",
            "latitude": 23.02290,
            "longitude": 72.57165,
            "elevation": 0.0,
            "length": 14.0,
            "width": 14.0,
            "height": 32.0,
            "direction_deg": 0.0,
            "metadata": {"floors": 8, "address": "Plot 18, Drive-In Road, Ahmedabad", "zone": "High-Density Commercial"}
        }
    ]
    
    bld_ids = {}
    for b in buildings:
        inserted = insert_asset(b)
        bld_ids[b["ulpin"]] = inserted["id"]
        
    # 2. INDIVIDUAL FLOORS / VERTICAL PROPERTY UNITS
    floors_data = []
    
    # Building A Floors (3 floors)
    b1_id = bld_ids["3D-ULPIN-GJ-AHM-BLD-001"]
    for i in range(1, 4):
        elev = (i - 1) * 4.0
        floors_data.append({
            "ulpin": f"3D-ULPIN-GJ-AHM-FLR-A0{i}",
            "name": f"Sabarmati Tech Hub - Floor {i}",
            "asset_type": "floor",
            "category": "property",
            "owner_agency": "Gujarat IT Development Corp",
            "latitude": 23.02270,
            "longitude": 72.57110,
            "elevation": elev,
            "height": 3.8,
            "length": 16.0,
            "width": 12.0,
            "floor_number": i,
            "parent_building_id": b1_id,
            "metadata": {"area_sqm": 192.0, "unit_type": "Office Space", "occupancy": "Active"}
        })
        
    # Building B Floors (5 floors)
    b2_id = bld_ids["3D-ULPIN-GJ-AHM-BLD-002"]
    for i in range(1, 6):
        elev = (i - 1) * 4.0
        floors_data.append({
            "ulpin": f"3D-ULPIN-GJ-AHM-FLR-B0{i}",
            "name": f"Navrang Residency - Apt {i}01",
            "asset_type": "floor",
            "category": "property",
            "owner_agency": f"Owner Apt {i}01",
            "latitude": 23.02230,
            "longitude": 72.57170,
            "elevation": elev,
            "height": 3.8,
            "length": 22.0,
            "width": 16.0,
            "floor_number": i,
            "parent_building_id": b2_id,
            "metadata": {"area_sqm": 352.0, "unit_type": "3BHK Apartment", "occupancy": "Owned"}
        })

    # Building C Floors (8 floors)
    b3_id = bld_ids["3D-ULPIN-GJ-AHM-BLD-003"]
    for i in range(1, 9):
        elev = (i - 1) * 4.0
        floors_data.append({
            "ulpin": f"3D-ULPIN-GJ-AHM-FLR-C0{i}",
            "name": f"Karnavati Tower - Unit {i}00",
            "asset_type": "floor",
            "category": "property",
            "owner_agency": "Karnavati Commercial Estate",
            "latitude": 23.02290,
            "longitude": 72.57165,
            "elevation": elev,
            "height": 3.8,
            "length": 14.0,
            "width": 14.0,
            "floor_number": i,
            "parent_building_id": b3_id,
            "metadata": {"area_sqm": 196.0, "unit_type": "Corporate Suite", "occupancy": "Leased"}
        })
        
    for fl in floors_data:
        insert_asset(fl)
        
    # 3. UNDERGROUND LINEAR UTILITIES (Pipelines & Cables)
    linear_assets = [
        {
            "ulpin": "3D-ULPIN-GJ-AHM-WAT-001",
            "name": "Ashram Road Main Water Supply Trunk",
            "asset_type": "water_pipe",
            "category": "infrastructure",
            "owner_agency": "Ahmedabad Municipal Corp (AMC)",
            "start_lat": 23.02280,
            "start_lon": 72.57100,
            "start_depth": -3.5,
            "length": 70.0,
            "direction": "EAST",
            "metadata": {"pipe_diameter_mm": 600, "material": "Ductile Iron", "pressure_bar": 4.5}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-WAT-002",
            "name": "Navrangpura Distribution Pipeline B",
            "asset_type": "water_pipe",
            "category": "infrastructure",
            "owner_agency": "Ahmedabad Municipal Corp (AMC)",
            "start_lat": 23.02215,
            "start_lon": 72.57110,
            "start_depth": -2.0,
            "length": 65.0,
            "direction": "EAST",
            "metadata": {"pipe_diameter_mm": 350, "material": "HDPE", "pressure_bar": 3.0}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-WAT-003",
            "name": "Sabarmati Western Feeder C",
            "asset_type": "water_pipe",
            "category": "infrastructure",
            "owner_agency": "Ahmedabad Municipal Corp (AMC)",
            "start_lat": 23.02310,
            "start_lon": 72.57150,
            "start_depth": -5.0,
            "length": 60.0,
            "direction": "SOUTH",
            "metadata": {"pipe_diameter_mm": 500, "material": "Cast Iron", "pressure_bar": 5.0}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-ELE-001",
            "name": "Torrent Power 33kV High Voltage Line",
            "asset_type": "electric_cable",
            "category": "infrastructure",
            "owner_agency": "Torrent Power Ltd",
            "start_lat": 23.02260,
            "start_lon": 72.57090,
            "start_depth": -4.5,
            "length": 75.0,
            "direction": "EAST",
            "metadata": {"voltage_kv": 33, "cable_type": "XLPE Armored", "circuits": 2}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-ELE-002",
            "name": "Substation Secondary Feeder Cable",
            "asset_type": "electric_cable",
            "category": "infrastructure",
            "owner_agency": "Torrent Power Ltd",
            "start_lat": 23.02295,
            "start_lon": 72.57135,
            "start_depth": -6.0,
            "length": 50.0,
            "direction": "SOUTH",
            "metadata": {"voltage_kv": 11, "cable_type": "Underground Conduit", "circuits": 1}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-FIB-001",
            "name": "BSNL Gigabit Fiber Optic Backbone",
            "asset_type": "fiber_cable",
            "category": "infrastructure",
            "owner_agency": "BSNL Telecommunications",
            "start_lat": 23.02210,
            "start_lon": 72.57100,
            "start_depth": -1.5,
            "length": 70.0,
            "direction": "EAST",
            "metadata": {"fiber_cores": 144, "duct_type": "Microduct Array", "bandwidth": "100 Gbps"}
        },
        {
            "ulpin": "3D-ULPIN-GJ-AHM-FIB-002",
            "name": "Jio Fiber Commercial Trunk line",
            "asset_type": "fiber_cable",
            "category": "infrastructure",
            "owner_agency": "Reliance Jio Infocomm",
            "start_lat": 23.02285,
            "start_lon": 72.57180,
            "start_depth": -2.5,
            "length": 55.0,
            "direction": "SOUTH",
            "metadata": {"fiber_cores": 96, "duct_type": "Armored HDPE", "bandwidth": "40 Gbps"}
        }
    ]
    
    for item in linear_assets:
        calc = calculate_pipeline_endpoint(
            item["start_lat"],
            item["start_lon"],
            item["start_depth"],
            item["length"],
            item["direction"]
        )
        
        asset_obj = {
            "ulpin": item["ulpin"],
            "name": item["name"],
            "asset_type": item["asset_type"],
            "category": item["category"],
            "owner_agency": item["owner_agency"],
            "latitude": item["start_lat"],
            "longitude": item["start_lon"],
            "elevation": 0.0,
            "depth": item["start_depth"],
            "length": item["length"],
            "width": 0.5,
            "height": 0.5,
            "direction_deg": calc["direction_deg"],
            "start_x": calc["start_x"],
            "start_y": calc["start_y"],
            "start_z": calc["start_z"],
            "end_x": calc["end_x"],
            "end_y": calc["end_y"],
            "end_z": calc["end_z"],
            "start_lat": item["start_lat"],
            "start_lon": item["start_lon"],
            "end_lat": calc["end_lat"],
            "end_lon": calc["end_lon"],
            "geometry": calc["geometry"],
            "metadata": item["metadata"]
        }
        insert_asset(asset_obj)

    print("Successfully seeded DB with 3 Buildings, 16 Floors, 3 Water Pipes, 2 Electric Cables, 2 Fiber Cables.")

if __name__ == "__main__":
    seed_database()
