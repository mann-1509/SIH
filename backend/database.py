import sqlite3
import json
import os
from typing import List, Dict, Optional, Any

DB_FILE = os.path.join(os.path.dirname(__file__), "ulpin_spatial.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ulpin TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        category TEXT NOT NULL,
        owner_agency TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        elevation REAL DEFAULT 0.0,
        depth REAL DEFAULT 0.0,
        length REAL DEFAULT 0.0,
        width REAL DEFAULT 0.0,
        height REAL DEFAULT 0.0,
        direction_deg REAL DEFAULT 0.0,
        start_x REAL,
        start_y REAL,
        start_z REAL,
        end_x REAL,
        end_y REAL,
        end_z REAL,
        start_lat REAL,
        start_lon REAL,
        end_lat REAL,
        end_lon REAL,
        floor_number INTEGER,
        parent_building_id INTEGER,
        geometry_json TEXT,
        metadata_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    conn.close()

def asset_row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    d = dict(row)
    if d.get("geometry_json"):
        try:
            d["geometry"] = json.loads(d["geometry_json"])
        except Exception:
            d["geometry"] = None
    else:
        d["geometry"] = None
        
    if d.get("metadata_json"):
        try:
            d["metadata"] = json.loads(d["metadata_json"])
        except Exception:
            d["metadata"] = {}
    else:
        d["metadata"] = {}
        
    return d

def get_all_assets() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assets ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [asset_row_to_dict(r) for r in rows]

def get_asset_by_ulpin_or_id(val: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if val.isdigit():
        cursor.execute("SELECT * FROM assets WHERE id = ?", (int(val),))
    else:
        cursor.execute("SELECT * FROM assets WHERE ulpin = ?", (val,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return asset_row_to_dict(row)
    return None

def insert_asset(asset_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    geom_json = json.dumps(asset_data.get("geometry")) if asset_data.get("geometry") else None
    meta_json = json.dumps(asset_data.get("metadata")) if asset_data.get("metadata") else None
    
    cursor.execute("""
    INSERT INTO assets (
        ulpin, name, asset_type, category, owner_agency,
        latitude, longitude, elevation, depth, length, width, height, direction_deg,
        start_x, start_y, start_z, end_x, end_y, end_z,
        start_lat, start_lon, end_lat, end_lon,
        floor_number, parent_building_id, geometry_json, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        asset_data["ulpin"],
        asset_data["name"],
        asset_data["asset_type"],
        asset_data["category"],
        asset_data.get("owner_agency", "Government Authority"),
        asset_data.get("latitude", 23.0225),
        asset_data.get("longitude", 72.5714),
        asset_data.get("elevation", 0.0),
        asset_data.get("depth", 0.0),
        asset_data.get("length", 0.0),
        asset_data.get("width", 0.0),
        asset_data.get("height", 0.0),
        asset_data.get("direction_deg", 0.0),
        asset_data.get("start_x"),
        asset_data.get("start_y"),
        asset_data.get("start_z"),
        asset_data.get("end_x"),
        asset_data.get("end_y"),
        asset_data.get("end_z"),
        asset_data.get("start_lat"),
        asset_data.get("start_lon"),
        asset_data.get("end_lat"),
        asset_data.get("end_lon"),
        asset_data.get("floor_number"),
        asset_data.get("parent_building_id"),
        geom_json,
        meta_json
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    return get_asset_by_ulpin_or_id(str(new_id))

def clear_assets():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM assets")
    conn.commit()
    conn.close()
