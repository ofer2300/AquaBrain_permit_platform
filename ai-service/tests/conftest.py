"""
Pytest Configuration and Fixtures
Shared fixtures for AI service tests.
"""

import pytest
import sys
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.rules_engine import RulesEngine, RuleCategory, RuleSeverity
from app.analysis_service import AnalysisService, DocumentType


@pytest.fixture
def rules_engine():
    """Create RulesEngine instance"""
    return RulesEngine()


@pytest.fixture
def analysis_service():
    """Create AnalysisService instance"""
    return AnalysisService()


@pytest.fixture
def sample_building_data() -> Dict[str, Any]:
    """Sample building data for testing validation rules"""
    return {
        "building": {
            "use_type": "residential",
            "num_floors": 4,
            "height_m": 12.0,
            "footprint_m2": 500.0,
            "total_floor_area_m2": 2000.0,
            "typical_floor_area_m2": 500.0,
            "max_occupancy": 100,
            "has_level_changes": True,
            "has_roof_access": True,
            "num_units": 10,
            "residential_area_m2": 1800.0,
            "commercial_area_m2": 200.0,
            "service_area_m2": 0.0,
            "setbacks": {
                "north": 3.5,
                "south": 3.0,
                "east": 2.5,
                "west": 2.5,
                "front": 4.0,
                "rear": 3.0,
                "side": 2.5
            },
            "parking": {
                "total_spaces": 15,
                "accessible_spaces": 1
            },
            "safety": {
                "fire_suppression": {
                    "has_sprinkler_system": True,
                    "has_fire_extinguishers": True,
                    "has_fire_alarm": True,
                    "has_fire_rated_elements": True
                },
                "evacuation": {
                    "num_emergency_exits": 2,
                    "exit_widths_cm": [120, 120],
                    "max_travel_distance_m": 25,
                    "has_emergency_lighting": True
                },
                "stairways": [
                    {
                        "id": "Stair-1",
                        "tread_depth_cm": 26,
                        "riser_height_cm": 18,
                        "width_cm": 130,
                        "headroom_cm": 220,
                        "landing_depth_cm": 130
                    }
                ],
                "railings": {
                    "balcony_height_cm": 115,
                    "stair_height_cm": 95,
                    "bar_spacing_cm": 10,
                    "load_capacity_kn": 2.0,
                    "has_roof_railing": True
                },
                "emergency_lighting": {
                    "has_system": True,
                    "backup_duration_minutes": 120,
                    "min_illumination_lux": 1.5,
                    "has_exit_signs": True,
                    "escape_route_coverage_percent": 100
                }
            },
            "accessibility": {
                "ramps": [
                    {
                        "id": "Ramp-1",
                        "rise_m": 0.3,
                        "run_m": 5.0,
                        "width_cm": 120,
                        "run_length_m": 5.0,
                        "has_landing": False,
                        "has_handrails": True
                    }
                ],
                "doors": [
                    {
                        "id": "Door-1",
                        "type": "entry",
                        "clear_width_cm": 95,
                        "threshold_height_cm": 1.5,
                        "maneuvering_space_cm": 160,
                        "has_lever_handle": True,
                        "is_fire_door": False
                    }
                ],
                "elevator": {
                    "has_elevator": True,
                    "car_width_cm": 120,
                    "car_depth_cm": 150,
                    "door_width_cm": 85,
                    "door_open_time_seconds": 3.5,
                    "has_braille_controls": True,
                    "has_audio_announcements": True,
                    "button_height_cm": 105
                }
            },
            "environmental": {
                "energy": {
                    "si5282_level": "intermediate",
                    "wall_u_value": 0.45,
                    "roof_u_value": 0.3,
                    "window_u_value": 1.8,
                    "has_solar_water_heating": True,
                    "led_coverage_percent": 90,
                    "renewable_capacity_kw": 25.0,
                    "has_low_flow_fixtures": True
                },
                "acoustic": {
                    "wall_rw_db": 54,
                    "floor_rw_db": 53,
                    "floor_ln_db": 56,
                    "facade_rw_db": 40,
                    "window_rw_db": 32
                }
            }
        },
        "plot": {
            "area_m2": 1000.0,
            "required_setbacks": {
                "north": 3.0,
                "south": 3.0,
                "east": 2.0,
                "west": 2.0,
                "front": 4.0,
                "rear": 3.0
            },
            "max_height_m": 15.0,
            "max_floors": 5,
            "max_coverage_percent": 60,
            "max_far": 2.5
        },
        "structural": {
            "dead_load_kn_m2": 4.0,
            "live_load_kn_m2": 2.5,
            "wind_load_kn_m2": 0.8,
            "seismic_coefficient": 0.15,
            "foundation": {
                "depth_m": 1.5,
                "soil_type": "sand",
                "bearing_capacity_kn_m2": 150
            },
            "columns": [
                {
                    "id": "Col-1",
                    "width_cm": 30,
                    "depth_cm": 35
                },
                {
                    "id": "Col-2",
                    "width_cm": 30,
                    "depth_cm": 30
                }
            ],
            "beams": [
                {
                    "id": "Beam-1",
                    "width_cm": 25,
                    "height_cm": 50,
                    "span_m": 5.0
                }
            ],
            "slabs": [
                {
                    "id": "Slab-1",
                    "thickness_cm": 18,
                    "span_m": 4.5,
                    "type": "solid"
                }
            ]
        },
        "location": {
            "seismic_zone": "moderate",
            "external_noise_db": 70
        }
    }


@pytest.fixture
def failing_building_data() -> Dict[str, Any]:
    """Building data that violates multiple rules"""
    return {
        "building": {
            "use_type": "commercial",
            "num_floors": 6,
            "height_m": 18.0,
            "footprint_m2": 700.0,
            "total_floor_area_m2": 3000.0,
            "typical_floor_area_m2": 500.0,
            "max_occupancy": 200,
            "has_level_changes": True,
            "has_roof_access": True,
            "num_units": 0,
            "setbacks": {
                "north": 2.0,
                "south": 1.5,
                "east": 1.0,
                "west": 1.0,
                "front": 2.5
            },
            "parking": {
                "total_spaces": 5,
                "accessible_spaces": 0
            },
            "safety": {
                "fire_suppression": {
                    "has_sprinkler_system": False,
                    "has_fire_extinguishers": False,
                    "has_fire_alarm": False,
                    "has_fire_rated_elements": False
                },
                "evacuation": {
                    "num_emergency_exits": 1,
                    "exit_widths_cm": [80],
                    "max_travel_distance_m": 35,
                    "has_emergency_lighting": False
                },
                "stairways": [
                    {
                        "id": "Stair-1",
                        "tread_depth_cm": 23,
                        "riser_height_cm": 21,
                        "width_cm": 100,
                        "headroom_cm": 200,
                        "landing_depth_cm": 90
                    }
                ],
                "railings": {
                    "balcony_height_cm": 100,
                    "stair_height_cm": 85,
                    "bar_spacing_cm": 15,
                    "load_capacity_kn": 1.2,
                    "has_roof_railing": False
                },
                "emergency_lighting": {
                    "has_system": False,
                    "backup_duration_minutes": 0,
                    "min_illumination_lux": 0,
                    "has_exit_signs": False,
                    "escape_route_coverage_percent": 0
                }
            },
            "accessibility": {
                "ramps": [],
                "doors": [
                    {
                        "id": "Door-1",
                        "type": "entry",
                        "clear_width_cm": 75,
                        "threshold_height_cm": 3.0,
                        "maneuvering_space_cm": 100,
                        "has_lever_handle": False,
                        "is_fire_door": True,
                        "has_auto_closer": True,
                        "closing_force_n": 30
                    }
                ],
                "elevator": {
                    "has_elevator": False
                }
            },
            "environmental": {
                "energy": {
                    "si5282_level": "",
                    "wall_u_value": 0.8,
                    "roof_u_value": 0.6,
                    "window_u_value": 2.5,
                    "has_solar_water_heating": False,
                    "led_coverage_percent": 30,
                    "renewable_capacity_kw": 5.0,
                    "has_low_flow_fixtures": False
                },
                "acoustic": {
                    "wall_rw_db": 48,
                    "floor_rw_db": 49,
                    "floor_ln_db": 62,
                    "facade_rw_db": 30,
                    "window_rw_db": 25
                }
            }
        },
        "plot": {
            "area_m2": 1000.0,
            "required_setbacks": {
                "north": 3.0,
                "south": 3.0,
                "east": 2.0,
                "west": 2.0,
                "front": 4.0,
                "rear": 3.0
            },
            "max_height_m": 15.0,
            "max_floors": 5,
            "max_coverage_percent": 50,
            "max_far": 2.0
        },
        "structural": {
            "dead_load_kn_m2": 3.0,
            "live_load_kn_m2": 1.5,
            "wind_load_kn_m2": 0.5,
            "seismic_coefficient": 0.08,
            "foundation": {
                "depth_m": 0.8,
                "soil_type": "clay",
                "bearing_capacity_kn_m2": 80
            },
            "columns": [
                {
                    "id": "Col-1",
                    "width_cm": 20,
                    "depth_cm": 20
                }
            ],
            "beams": [
                {
                    "id": "Beam-1",
                    "width_cm": 18,
                    "height_cm": 35,
                    "span_m": 6.0
                }
            ],
            "slabs": [
                {
                    "id": "Slab-1",
                    "thickness_cm": 10,
                    "span_m": 5.0,
                    "type": "solid"
                }
            ]
        },
        "location": {
            "seismic_zone": "high",
            "external_noise_db": 80
        }
    }


@pytest.fixture
def minimal_building_data() -> Dict[str, Any]:
    """Minimal building data for edge case testing"""
    return {
        "building": {
            "use_type": "residential",
            "num_floors": 1,
            "height_m": 3.0,
            "footprint_m2": 100.0,
            "total_floor_area_m2": 100.0,
            "setbacks": {}
        },
        "plot": {
            "area_m2": 500.0
        },
        "structural": {}
    }
