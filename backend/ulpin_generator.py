import hashlib
import random
import time

def generate_3d_ulpin(asset_type: str, category: str, lat: float, lon: float, depth_or_elev: float, name: str = "") -> str:
    """
    Generates a deterministic Prototype 3D ULPIN.
    Format: 3D-ULPIN-GJ-AHM-[TYPE_CODE]-[UNIQUE_HASH]
    Example: 3D-ULPIN-GJ-AHM-WAT-8F2A91
    """
    type_map = {
        "building": "BLD",
        "floor": "FLR",
        "apartment": "APT",
        "water_pipe": "WAT",
        "electric_cable": "ELE",
        "fiber_cable": "FIB",
        "other": "INF"
    }
    
    code = type_map.get(asset_type.lower(), "AST")
    
    # Hash seed using spatial coordinates and seed time/name
    raw = f"{asset_type}_{category}_{lat:.5f}_{lon:.5f}_{depth_or_elev:.2f}_{name}_{time.time_ns()}"
    h = hashlib.sha256(raw.encode('utf-8')).hexdigest().upper()[:6]
    
    return f"3D-ULPIN-GJ-AHM-{code}-{h}"
