from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PipelineCreateRequest(BaseModel):
    name: str = Field(..., example="Main Supply Water Line A")
    asset_type: str = Field(..., example="water_pipe") # water_pipe, electric_cable, fiber_cable, other
    owner_agency: str = Field("Ahmedabad Municipal Corp", example="AMC Water Dept")
    start_lat: float = Field(..., example=23.0225)
    start_lon: float = Field(..., example=72.5714)
    start_depth: float = Field(..., example=-4.0) # Depth underground in meters (negative)
    end_depth: Optional[float] = Field(None, example=-4.0)
    length: float = Field(..., example=40.0) # Length in meters
    direction: str = Field("EAST", example="EAST") # NORTH, EAST, SOUTH, WEST, NORTHEAST, etc.
    custom_angle: Optional[float] = Field(None, example=90.0)
    proposed_radius: Optional[float] = Field(0.35, example=0.35)
    safety_clearance: Optional[float] = Field(1.2, example=1.2)
    check_conflicts: Optional[bool] = Field(True, example=True)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class PropertyCreateRequest(BaseModel):
    name: str = Field(..., example="Gift Tower Block A")
    asset_type: str = Field("building", example="building") # building, floor, apartment
    owner_agency: str = Field("Urban Development Authority", example="Gujarat Housing Board")
    latitude: float = Field(..., example=23.0226)
    longitude: float = Field(..., example=72.5715)
    elevation: float = Field(0.0, example=0.0)
    length: float = Field(15.0, example=15.0)
    width: float = Field(12.0, example=12.0)
    height: float = Field(18.0, example=18.0)
    num_floors: Optional[int] = Field(5, example=5)
    address: Optional[str] = Field("Sector 1, Ahmedabad", example="Sector 1")
    property_type: Optional[str] = Field("Commercial", example="Commercial")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ConflictCheckRequest(BaseModel):
    start_lat: float
    start_lon: float
    start_depth: float
    length: float
    direction: str
    custom_angle: Optional[float] = None
    asset_type: str = "water_pipe"
    proposed_radius: float = 0.3
    safety_clearance: float = 1.2
