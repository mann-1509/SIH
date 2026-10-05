import math
from typing import Dict, Tuple, List, Optional

# Reference Origin for Fictional Ahmedabad Plot
BASE_LAT = 23.0225
BASE_LON = 72.5714

# Meters per degree at latitude 23.0225 N
LAT_TO_METERS = 110574.0
LON_TO_METERS = 111320.0 * math.cos(math.radians(BASE_LAT)) # approx 102500 m/deg

DIRECTION_ANGLES = {
    "NORTH": 0.0,
    "NORTHEAST": 45.0,
    "EAST": 90.0,
    "SOUTHEAST": 135.0,
    "SOUTH": 180.0,
    "SOUTHWEST": 225.0,
    "WEST": 270.0,
    "NORTHWEST": 315.0
}

def latlon_to_local_xy(lat: float, lon: float) -> Tuple[float, float]:
    """Convert Lat/Lon to local 3D meters relative to reference origin (0, 0).
    X = Easting (meters)
    Z = Northing (negative meters in Three.js Z-axis)
    """
    x = (lon - BASE_LON) * LON_TO_METERS
    z = -(lat - BASE_LAT) * LAT_TO_METERS
    return (round(x, 3), round(z, 3))

def local_xy_to_latlon(x: float, z: float) -> Tuple[float, float]:
    """Convert local 3D meters (x, z) back to Lat/Lon."""
    lon = BASE_LON + (x / LON_TO_METERS)
    lat = BASE_LAT - (z / LAT_TO_METERS)
    return (round(lat, 6), round(lon, 6))

def get_direction_angle(direction_str: str, custom_angle: Optional[float] = None) -> float:
    if custom_angle is not None:
        return custom_angle % 360.0
    dir_upper = direction_str.upper().strip()
    return DIRECTION_ANGLES.get(dir_upper, 0.0)

def calculate_pipeline_endpoint(
    start_lat: float,
    start_lon: float,
    start_depth: float,
    length: float,
    direction: str,
    custom_angle: Optional[float] = None,
    end_depth: Optional[float] = None
) -> Dict:
    """
    Calculates 3D endpoint, geometry, and local coordinates for a straight pipeline.
    start_depth is negative (e.g. -4.0 meters underground).
    """
    angle_deg = get_direction_angle(direction, custom_angle)
    angle_rad = math.radians(angle_deg)
    
    start_x, start_z = latlon_to_local_xy(start_lat, start_lon)
    start_y = start_depth  # e.g., -4.0
    
    # In 3D coordinate system (Three.js):
    # North = 0 deg -> -Z direction
    # East = 90 deg -> +X direction
    # South = 180 deg -> +Z direction
    # West = 270 deg -> -X direction
    dx = length * math.sin(angle_rad)
    dz = -length * math.cos(angle_rad)
    
    end_x = start_x + dx
    end_z = start_z + dz
    end_y = end_depth if end_depth is not None else start_y
    
    end_lat, end_lon = local_xy_to_latlon(end_x, end_z)
    
    return {
        "start_x": start_x,
        "start_y": start_y,
        "start_z": start_z,
        "end_x": round(end_x, 3),
        "end_y": round(end_y, 3),
        "end_z": round(end_z, 3),
        "end_lat": end_lat,
        "end_lon": end_lon,
        "direction_deg": angle_deg,
        "geometry": [
            [start_x, start_y, start_z],
            [round(end_x, 3), round(end_y, 3), round(end_z, 3)]
        ]
    }

# --- 3D VECTOR & DISTANCE MATH FOR DETERMINISTIC CONFLICT DETECTION ---

def vector_sub(a: List[float], b: List[float]) -> List[float]:
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

def vector_add(a: List[float], b: List[float]) -> List[float]:
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

def vector_scale(v: List[float], s: float) -> List[float]:
    return [v[0] * s, v[1] * s, v[2] * s]

def vector_dot(a: List[float], b: List[float]) -> float:
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

def vector_length(v: List[float]) -> float:
    return math.sqrt(vector_dot(v, v))

def distance_3d(a: List[float], b: List[float]) -> float:
    return vector_length(vector_sub(a, b))

def closest_point_on_segment(p: List[float], a: List[float], b: List[float]) -> Tuple[List[float], float]:
    """Returns closest point on 3D segment AB to point P, and fraction t in [0, 1]."""
    ab = vector_sub(b, a)
    ab_len_sq = vector_dot(ab, ab)
    if ab_len_sq == 0:
        return a, 0.0
    ap = vector_sub(p, a)
    t = max(0.0, min(1.0, vector_dot(ap, ab) / ab_len_sq))
    closest = vector_add(a, vector_scale(ab, t))
    return closest, t

def shortest_distance_segment_to_segment(
    p1: List[float], p2: List[float],
    q1: List[float], q2: List[float]
) -> Tuple[float, List[float], List[float]]:
    """
    Computes minimum 3D distance between segment P1-P2 and segment Q1-Q2.
    Returns (min_distance, closest_point_on_P, closest_point_on_Q).
    """
    d1 = vector_sub(p2, p1)
    d2 = vector_sub(q2, q1)
    r = vector_sub(p1, q1)
    
    a = vector_dot(d1, d1)
    b = vector_dot(d1, d2)
    c = vector_dot(d2, d2)
    d = vector_dot(d1, r)
    e = vector_dot(d2, r)
    
    denom = a * c - b * b
    
    if denom != 0.0:
        s = max(0.0, min(1.0, (b * e - c * d) / denom))
    else:
        s = 0.0
        
    t = (b * s + e) / c if c != 0.0 else 0.0
    
    if t < 0.0:
        t = 0.0
        s = max(0.0, min(1.0, -d / a)) if a != 0.0 else 0.0
    elif t > 1.0:
        t = 1.0
        s = max(0.0, min(1.0, (b - d) / a)) if a != 0.0 else 0.0
        
    c1 = vector_add(p1, vector_scale(d1, s))
    c2 = vector_add(q1, vector_scale(d2, t))
    
    dist = distance_3d(c1, c2)
    return dist, c1, c2

def check_3d_conflict(
    proposed_p1: List[float],
    proposed_p2: List[float],
    proposed_radius: float,
    existing_asset: Dict,
    safety_clearance: float = 1.0
) -> Optional[Dict]:
    """
    Determines if a proposed pipeline conflicts with an existing asset in 3D space.
    """
    asset_type = existing_asset["asset_type"]
    
    # Linear asset (pipeline, electrical cable, fiber)
    if existing_asset.get("start_x") is not None and existing_asset.get("end_x") is not None:
        e1 = [existing_asset["start_x"], existing_asset["start_y"], existing_asset["start_z"]]
        e2 = [existing_asset["end_x"], existing_asset["end_y"], existing_asset["end_z"]]
        
        # radius estimate based on type
        exist_radius = 0.3 if "pipe" in asset_type else 0.15
        threshold = proposed_radius + exist_radius + safety_clearance
        
        min_dist, cp_proposed, cp_existing = shortest_distance_segment_to_segment(proposed_p1, proposed_p2, e1, e2)
        
        if min_dist <= threshold:
            conflict_point = vector_scale(vector_add(cp_proposed, cp_existing), 0.5)
            c_lat, c_lon = local_xy_to_latlon(conflict_point[0], conflict_point[2])
            
            return {
                "conflict": True,
                "existing_ulpin": existing_asset["ulpin"],
                "existing_name": existing_asset["name"],
                "existing_type": existing_asset["asset_type"],
                "existing_category": existing_asset.get("category", "infrastructure"),
                "existing_owner": existing_asset["owner_agency"],
                "minimum_distance_m": round(min_dist, 2),
                "required_clearance_m": round(threshold, 2),
                "conflict_x": round(conflict_point[0], 2),
                "conflict_y": round(conflict_point[1], 2),
                "conflict_z": round(conflict_point[2], 2),
                "conflict_lat": c_lat,
                "conflict_lon": c_lon,
                "status": "CRITICAL INTERSECTION" if min_dist < 0.5 else "UNSAFE PROXIMITY"
            }
            
    # Box/Building property asset
    elif existing_asset.get("latitude") is not None:
        bx, bz = latlon_to_local_xy(existing_asset["latitude"], existing_asset["longitude"])
        by_min = existing_asset.get("elevation", 0.0)
        by_max = by_min + existing_asset.get("height", 10.0)
        w = existing_asset.get("width", 10.0) / 2.0
        l = existing_asset.get("length", 10.0) / 2.0
        
        # Box bounds
        min_box = [bx - w - safety_clearance, by_min - safety_clearance, bz - l - safety_clearance]
        max_box = [bx + w + safety_clearance, by_max + safety_clearance, bz + l + safety_clearance]
        
        # Sample points along proposed pipeline
        samples = 20
        for i in range(samples + 1):
            t = i / samples
            px = proposed_p1[0] + t * (proposed_p2[0] - proposed_p1[0])
            py = proposed_p1[1] + t * (proposed_p2[1] - proposed_p1[1])
            pz = proposed_p1[2] + t * (proposed_p2[2] - proposed_p1[2])
            
            if (min_box[0] <= px <= max_box[0] and
                min_box[1] <= py <= max_box[1] and
                min_box[2] <= pz <= max_box[2]):
                
                c_lat, c_lon = local_xy_to_latlon(px, pz)
                return {
                    "conflict": True,
                    "existing_ulpin": existing_asset["ulpin"],
                    "existing_name": existing_asset["name"],
                    "existing_type": existing_asset["asset_type"],
                    "existing_category": existing_asset.get("category", "property"),
                    "existing_owner": existing_asset["owner_agency"],
                    "minimum_distance_m": 0.0,
                    "required_clearance_m": round(safety_clearance, 2),
                    "conflict_x": round(px, 2),
                    "conflict_y": round(py, 2),
                    "conflict_z": round(pz, 2),
                    "conflict_lat": c_lat,
                    "conflict_lon": c_lon,
                    "status": "STRUCTURE ENCROACHMENT"
                }

    return None
    

def evaluate_all_conflicts(
    proposed_p1: List[float],
    proposed_p2: List[float],
    proposed_radius: float,
    all_assets: List[Dict],
    safety_clearance: float = 1.2,
    exclude_ulpin: Optional[str] = None
) -> Dict:
    """
    Evaluates proposed 3D line segment against all infrastructure and property assets.
    Reuses deterministic 3D conflict engine and tracks closest clearance distance.
    """
    conflicts = []
    min_measured_distance = float('inf')
    
    for asset in all_assets:
        if asset.get("asset_type") == "floor":
            continue
        if exclude_ulpin and asset.get("ulpin") == exclude_ulpin:
            continue
            
        result = check_3d_conflict(
            proposed_p1,
            proposed_p2,
            proposed_radius,
            asset,
            safety_clearance
        )
        if result:
            conflicts.append(result)
            
        # Track shortest 3D distance across all linear infrastructure assets
        if asset.get("start_x") is not None and asset.get("end_x") is not None:
            e1 = [asset["start_x"], asset["start_y"], asset["start_z"]]
            e2 = [asset["end_x"], asset["end_y"], asset["end_z"]]
            d, _, _ = shortest_distance_segment_to_segment(proposed_p1, proposed_p2, e1, e2)
            if d < min_measured_distance:
                min_measured_distance = d
                
    # Sort conflicts by severity (smallest distance first)
    conflicts.sort(key=lambda c: c.get("minimum_distance_m", 0.0))

    if min_measured_distance == float('inf'):
        min_measured_distance = 10.0
        
    return {
        "has_conflict": len(conflicts) > 0,
        "conflicts": conflicts,
        "min_measured_distance_m": round(min_measured_distance, 2)
    }
