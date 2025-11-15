"""
Rules Engine for Building Permit Validation
Validates building permits against Israeli building codes and standards.

This module implements the core validation logic for 20 building rules across 5 categories:
- Structural (5 rules)
- Zoning (5 rules)
- Safety (5 rules)
- Accessibility (3 rules)
- Environmental (2 rules)
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class RuleSeverity(Enum):
    """Rule violation severity levels"""
    CRITICAL = "critical"  # Must fix - permit cannot be approved
    HIGH = "high"  # Should fix - significant issue
    MEDIUM = "medium"  # Recommended fix
    LOW = "low"  # Advisory


class RuleCategory(Enum):
    """Rule categories based on Israeli building codes"""
    STRUCTURAL = "structural"
    ZONING = "zoning"
    SAFETY = "safety"
    ACCESSIBILITY = "accessibility"
    ENVIRONMENTAL = "environmental"


@dataclass
class ValidationResult:
    """Result of a rule validation"""
    rule_id: str
    passed: bool
    violations: List[str]
    warnings: List[str]
    evidence: Dict[str, Any]
    severity: RuleSeverity

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "rule_id": self.rule_id,
            "passed": self.passed,
            "violations": self.violations,
            "warnings": self.warnings,
            "evidence": self.evidence,
            "severity": self.severity.value
        }


class BuildingRule:
    """Base class for all building validation rules"""

    def __init__(self, rule_id: str, name_he: str, name_en: str,
                 category: RuleCategory, severity: RuleSeverity):
        self.rule_id = rule_id
        self.name_he = name_he
        self.name_en = name_en
        self.category = category
        self.severity = severity

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        """
        Validate the rule against provided data

        Args:
            data: Dictionary containing building and plot data

        Returns:
            ValidationResult with validation outcome
        """
        raise NotImplementedError("Subclasses must implement validate()")

    def to_dict(self) -> Dict[str, Any]:
        """Convert rule to dictionary"""
        return {
            "rule_id": self.rule_id,
            "name_he": self.name_he,
            "name_en": self.name_en,
            "category": self.category.value,
            "severity": self.severity.value
        }


# ============================================================================
# STRUCTURAL RULES (5)
# ============================================================================

class StrLoad001(BuildingRule):
    """STR-LOAD-001: Design loads verification per SI 413"""

    def __init__(self):
        super().__init__(
            rule_id="STR-LOAD-001",
            name_he="אימות עומסי תכנון",
            name_en="Design loads verification",
            category=RuleCategory.STRUCTURAL,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        structural_data = data.get("structural", {})

        # Dead load (עומס מת) - SI 413 Table 1
        dead_load = structural_data.get("dead_load_kn_m2", 0)
        evidence["dead_load_kn_m2"] = dead_load

        if dead_load < 3.5:
            violations.append(f"Dead load {dead_load} kN/m² is below minimum 3.5 kN/m² (SI 413)")
        elif dead_load < 4.0:
            warnings.append(f"Dead load {dead_load} kN/m² is low, verify calculations")

        # Live load (עומס חי) - SI 413 Table 2
        live_load = structural_data.get("live_load_kn_m2", 0)
        building_use = data.get("building", {}).get("use_type", "residential")
        evidence["live_load_kn_m2"] = live_load
        evidence["building_use"] = building_use

        # Minimum live loads by use type (SI 413)
        min_live_loads = {
            "residential": 2.0,
            "office": 2.5,
            "commercial": 4.0,
            "storage": 5.0,
            "assembly": 5.0
        }

        min_live_load = min_live_loads.get(building_use, 2.0)
        if live_load < min_live_load:
            violations.append(
                f"Live load {live_load} kN/m² is below minimum {min_live_load} kN/m² "
                f"for {building_use} use (SI 413 Table 2)"
            )

        # Wind load (עומס רוח) - SI 413 Part 7
        wind_load = structural_data.get("wind_load_kn_m2", 0)
        evidence["wind_load_kn_m2"] = wind_load

        if wind_load < 0.6:
            violations.append(f"Wind load {wind_load} kN/m² is below minimum 0.6 kN/m² (SI 413)")

        # Seismic load (עומס רעידות אדמה) - SI 413 Part 5
        seismic_zone = data.get("location", {}).get("seismic_zone", "")
        seismic_coefficient = structural_data.get("seismic_coefficient", 0)
        evidence["seismic_zone"] = seismic_zone
        evidence["seismic_coefficient"] = seismic_coefficient

        if seismic_coefficient < 0.1:
            violations.append(
                f"Seismic coefficient {seismic_coefficient} is below minimum 0.1 (SI 413)"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class StrFound002(BuildingRule):
    """STR-FOUND-002: Foundation depth minimum per SI 466"""

    def __init__(self):
        super().__init__(
            rule_id="STR-FOUND-002",
            name_he="עומק יסוד מינימלי",
            name_en="Foundation depth minimum",
            category=RuleCategory.STRUCTURAL,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        structural_data = data.get("structural", {})
        foundation_data = structural_data.get("foundation", {})

        # Foundation depth (עומק יסוד)
        foundation_depth = foundation_data.get("depth_m", 0)
        evidence["foundation_depth_m"] = foundation_depth

        # Minimum depth per SI 466: 1.0m below grade
        if foundation_depth < 1.0:
            violations.append(
                f"Foundation depth {foundation_depth}m is below minimum 1.0m (SI 466 Section 4.2)"
            )
        elif foundation_depth < 1.2:
            warnings.append(
                f"Foundation depth {foundation_depth}m is minimal, consider deeper foundation"
            )

        # Soil type verification
        soil_type = foundation_data.get("soil_type", "")
        evidence["soil_type"] = soil_type

        # Minimum depths by soil type (SI 466)
        min_depths_by_soil = {
            "rock": 0.8,
            "gravel": 1.0,
            "sand": 1.2,
            "clay": 1.5,
            "organic": 2.0
        }

        if soil_type in min_depths_by_soil:
            min_depth = min_depths_by_soil[soil_type]
            evidence["min_depth_for_soil"] = min_depth

            if foundation_depth < min_depth:
                violations.append(
                    f"Foundation depth {foundation_depth}m is below minimum {min_depth}m "
                    f"for {soil_type} soil (SI 466)"
                )
        else:
            warnings.append(f"Soil type '{soil_type}' not recognized, verify foundation depth")

        # Bearing capacity check
        bearing_capacity = foundation_data.get("bearing_capacity_kn_m2", 0)
        evidence["bearing_capacity_kn_m2"] = bearing_capacity

        if bearing_capacity < 100:
            violations.append(
                f"Bearing capacity {bearing_capacity} kN/m² is below minimum 100 kN/m² (SI 466)"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class StrColumn003(BuildingRule):
    """STR-COLUMN-003: Column dimensions per SI 466"""

    def __init__(self):
        super().__init__(
            rule_id="STR-COLUMN-003",
            name_he="מידות עמודים",
            name_en="Column dimensions",
            category=RuleCategory.STRUCTURAL,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        structural_data = data.get("structural", {})
        columns_data = structural_data.get("columns", [])

        if not columns_data:
            violations.append("No column data provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        building_data = data.get("building", {})
        num_floors = building_data.get("num_floors", 1)
        evidence["num_floors"] = num_floors

        for i, column in enumerate(columns_data):
            column_id = column.get("id", f"Column-{i+1}")
            width = column.get("width_cm", 0)
            depth = column.get("depth_cm", 0)
            evidence[f"{column_id}_dimensions"] = f"{width}x{depth}cm"

            # Minimum column dimension: 25cm per SI 466
            min_dimension = 25
            if width < min_dimension or depth < min_dimension:
                violations.append(
                    f"{column_id}: Dimension {width}x{depth}cm has side below minimum {min_dimension}cm "
                    f"(SI 466 Section 7.4.1)"
                )

            # Minimum area based on number of floors
            area_cm2 = width * depth
            min_area = 625  # 25cm x 25cm = 625 cm²

            if num_floors > 3:
                min_area = 900  # 30cm x 30cm for buildings > 3 floors

            if area_cm2 < min_area:
                violations.append(
                    f"{column_id}: Area {area_cm2}cm² is below minimum {min_area}cm² "
                    f"for {num_floors}-floor building (SI 466)"
                )

            # Aspect ratio check (slenderness)
            max_dimension = max(width, depth)
            min_dimension_actual = min(width, depth)
            aspect_ratio = max_dimension / min_dimension_actual if min_dimension_actual > 0 else 0
            evidence[f"{column_id}_aspect_ratio"] = round(aspect_ratio, 2)

            if aspect_ratio > 3.0:
                warnings.append(
                    f"{column_id}: Aspect ratio {aspect_ratio:.2f} exceeds recommended 3.0, "
                    f"verify slenderness calculations"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class StrBeam004(BuildingRule):
    """STR-BEAM-004: Beam dimensions per SI 466"""

    def __init__(self):
        super().__init__(
            rule_id="STR-BEAM-004",
            name_he="מידות קורות",
            name_en="Beam dimensions",
            category=RuleCategory.STRUCTURAL,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        structural_data = data.get("structural", {})
        beams_data = structural_data.get("beams", [])

        if not beams_data:
            violations.append("No beam data provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        for i, beam in enumerate(beams_data):
            beam_id = beam.get("id", f"Beam-{i+1}")
            width = beam.get("width_cm", 0)
            height = beam.get("height_cm", 0)
            span = beam.get("span_m", 0)
            evidence[f"{beam_id}_dimensions"] = f"{width}x{height}cm, span={span}m"

            # Minimum beam width: 20cm per SI 466
            if width < 20:
                violations.append(
                    f"{beam_id}: Width {width}cm is below minimum 20cm (SI 466 Section 9.2.1)"
                )

            # Minimum beam height based on span (SI 466: h ≥ span/12)
            min_height_cm = (span * 100) / 12  # span in meters, convert to cm
            evidence[f"{beam_id}_min_height_cm"] = round(min_height_cm, 1)

            if height < min_height_cm:
                violations.append(
                    f"{beam_id}: Height {height}cm is below minimum {min_height_cm:.1f}cm "
                    f"for span {span}m (h ≥ span/12, SI 466)"
                )
            elif height < min_height_cm * 1.1:
                warnings.append(
                    f"{beam_id}: Height {height}cm is minimal for span {span}m, "
                    f"recommend ≥{min_height_cm*1.1:.1f}cm"
                )

            # Maximum span without intermediate support
            max_span = 8.0  # 8m per SI 466
            if span > max_span:
                warnings.append(
                    f"{beam_id}: Span {span}m exceeds recommended maximum {max_span}m, "
                    f"verify deflection calculations"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class StrSlab005(BuildingRule):
    """STR-SLAB-005: Slab thickness per SI 466"""

    def __init__(self):
        super().__init__(
            rule_id="STR-SLAB-005",
            name_he="עובי תקרה",
            name_en="Slab thickness",
            category=RuleCategory.STRUCTURAL,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        structural_data = data.get("structural", {})
        slabs_data = structural_data.get("slabs", [])

        if not slabs_data:
            violations.append("No slab data provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        for i, slab in enumerate(slabs_data):
            slab_id = slab.get("id", f"Slab-{i+1}")
            thickness = slab.get("thickness_cm", 0)
            span = slab.get("span_m", 0)
            slab_type = slab.get("type", "solid")  # solid, ribbed, hollow-core
            evidence[f"{slab_id}_data"] = f"thickness={thickness}cm, span={span}m, type={slab_type}"

            # Minimum slab thickness based on span (SI 466)
            if slab_type == "solid":
                # Solid slab: h ≥ span/30
                min_thickness_cm = (span * 100) / 30
            elif slab_type == "ribbed":
                # Ribbed slab: h ≥ span/25
                min_thickness_cm = (span * 100) / 25
            else:
                # Default to solid
                min_thickness_cm = (span * 100) / 30

            evidence[f"{slab_id}_min_thickness_cm"] = round(min_thickness_cm, 1)

            if thickness < min_thickness_cm:
                violations.append(
                    f"{slab_id}: Thickness {thickness}cm is below minimum {min_thickness_cm:.1f}cm "
                    f"for {slab_type} slab with span {span}m (SI 466)"
                )

            # Absolute minimum thickness: 12cm for solid slabs
            absolute_min = 12
            if slab_type == "solid" and thickness < absolute_min:
                violations.append(
                    f"{slab_id}: Thickness {thickness}cm is below absolute minimum {absolute_min}cm "
                    f"for solid slab (SI 466 Section 9.3.1)"
                )

            # Warning for thin slabs
            if thickness < 15 and span > 4.0:
                warnings.append(
                    f"{slab_id}: Thickness {thickness}cm is thin for span {span}m, "
                    f"verify deflection and vibration"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


# ============================================================================
# ZONING RULES (5)
# ============================================================================

class ZonSetback001(BuildingRule):
    """ZON-SETBACK-001: Building setbacks from property line per TABA"""

    def __init__(self):
        super().__init__(
            rule_id="ZON-SETBACK-001",
            name_he="נסיגה מגבול המגרש",
            name_en="Building setbacks from property line",
            category=RuleCategory.ZONING,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        plot_data = data.get("plot", {})
        building_data = data.get("building", {})

        # Get required setbacks from TABA (תב"ע)
        required_setbacks = plot_data.get("required_setbacks", {})
        actual_setbacks = building_data.get("setbacks", {})

        # Standard directions
        directions = ["north", "south", "east", "west", "front", "rear", "side"]

        for direction in directions:
            required = required_setbacks.get(direction, 0)
            actual = actual_setbacks.get(direction, 0)

            if required > 0:  # Only check if there's a requirement
                evidence[f"setback_{direction}"] = f"required={required}m, actual={actual}m"

                if actual < required:
                    shortage = required - actual
                    violations.append(
                        f"{direction.capitalize()} setback {actual}m is below required {required}m "
                        f"(shortage: {shortage}m) per TABA"
                    )
                elif actual < required + 0.5:
                    warnings.append(
                        f"{direction.capitalize()} setback {actual}m is minimal, "
                        f"only {actual - required}m above required {required}m"
                    )

        # Check minimum setback from any property line (default 3m if not specified)
        min_setback = min(actual_setbacks.values()) if actual_setbacks else 0
        evidence["minimum_setback"] = f"{min_setback}m"

        default_min = 3.0
        if min_setback < default_min and not required_setbacks:
            violations.append(
                f"Minimum setback {min_setback}m is below default minimum {default_min}m"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class ZonHeight002(BuildingRule):
    """ZON-HEIGHT-002: Maximum building height per TABA"""

    def __init__(self):
        super().__init__(
            rule_id="ZON-HEIGHT-002",
            name_he="גובה בניין מקסימלי",
            name_en="Maximum building height",
            category=RuleCategory.ZONING,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        plot_data = data.get("plot", {})
        building_data = data.get("building", {})

        # Building height
        building_height = building_data.get("height_m", 0)
        max_height = plot_data.get("max_height_m", 0)

        evidence["building_height_m"] = building_height
        evidence["max_allowed_height_m"] = max_height

        if max_height > 0:
            if building_height > max_height:
                excess = building_height - max_height
                violations.append(
                    f"Building height {building_height}m exceeds maximum {max_height}m "
                    f"(excess: {excess}m) per TABA"
                )
            elif building_height > max_height * 0.95:
                warnings.append(
                    f"Building height {building_height}m is very close to maximum {max_height}m, "
                    f"only {max_height - building_height}m margin"
                )

        # Alternative: check by number of floors
        num_floors = building_data.get("num_floors", 0)
        max_floors = plot_data.get("max_floors", 0)

        evidence["num_floors"] = num_floors
        evidence["max_floors"] = max_floors

        if max_floors > 0:
            if num_floors > max_floors:
                violations.append(
                    f"Number of floors {num_floors} exceeds maximum {max_floors} per TABA"
                )

        # Check floor height reasonableness (typical 3.0m per floor)
        if num_floors > 0 and building_height > 0:
            avg_floor_height = building_height / num_floors
            evidence["avg_floor_height_m"] = round(avg_floor_height, 2)

            if avg_floor_height < 2.6:
                violations.append(
                    f"Average floor height {avg_floor_height:.2f}m is below minimum 2.6m"
                )
            elif avg_floor_height > 4.5:
                warnings.append(
                    f"Average floor height {avg_floor_height:.2f}m is unusually high, verify"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class ZonCoverage003(BuildingRule):
    """ZON-COVERAGE-003: Building coverage percentage per TABA"""

    def __init__(self):
        super().__init__(
            rule_id="ZON-COVERAGE-003",
            name_he="אחוז כיסוי",
            name_en="Building coverage percentage",
            category=RuleCategory.ZONING,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        plot_data = data.get("plot", {})
        building_data = data.get("building", {})

        # Plot area
        plot_area = plot_data.get("area_m2", 0)
        evidence["plot_area_m2"] = plot_area

        if plot_area == 0:
            violations.append("Plot area not provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        # Building footprint
        building_footprint = building_data.get("footprint_m2", 0)
        evidence["building_footprint_m2"] = building_footprint

        # Calculate coverage percentage
        coverage_percent = (building_footprint / plot_area) * 100
        evidence["coverage_percent"] = round(coverage_percent, 2)

        # Maximum allowed coverage from TABA
        max_coverage = plot_data.get("max_coverage_percent", 0)
        evidence["max_coverage_percent"] = max_coverage

        if max_coverage > 0:
            if coverage_percent > max_coverage:
                excess = coverage_percent - max_coverage
                violations.append(
                    f"Building coverage {coverage_percent:.1f}% exceeds maximum {max_coverage}% "
                    f"(excess: {excess:.1f}%) per TABA"
                )
            elif coverage_percent > max_coverage * 0.95:
                warnings.append(
                    f"Building coverage {coverage_percent:.1f}% is very close to maximum {max_coverage}%, "
                    f"only {max_coverage - coverage_percent:.1f}% margin"
                )
        else:
            # Default maximum coverage if not specified (50% for residential)
            default_max = 50
            if coverage_percent > default_max:
                warnings.append(
                    f"Building coverage {coverage_percent:.1f}% exceeds typical maximum {default_max}%"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class ZonFar004(BuildingRule):
    """ZON-FAR-004: Floor Area Ratio (תב"ע)"""

    def __init__(self):
        super().__init__(
            rule_id="ZON-FAR-004",
            name_he="תכסית קומות (תב\"ע)",
            name_en="Floor Area Ratio (FAR)",
            category=RuleCategory.ZONING,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        plot_data = data.get("plot", {})
        building_data = data.get("building", {})

        # Plot area
        plot_area = plot_data.get("area_m2", 0)
        evidence["plot_area_m2"] = plot_area

        if plot_area == 0:
            violations.append("Plot area not provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        # Total floor area (gross floor area - שטח כל הקומות)
        total_floor_area = building_data.get("total_floor_area_m2", 0)
        evidence["total_floor_area_m2"] = total_floor_area

        # Calculate FAR
        far = total_floor_area / plot_area
        evidence["far"] = round(far, 2)

        # Maximum allowed FAR from TABA
        max_far = plot_data.get("max_far", 0)
        evidence["max_far"] = max_far

        if max_far > 0:
            if far > max_far:
                excess = far - max_far
                excess_area = excess * plot_area
                violations.append(
                    f"FAR {far:.2f} exceeds maximum {max_far} (excess: {excess:.2f}, "
                    f"excess area: {excess_area:.1f}m²) per TABA"
                )
            elif far > max_far * 0.95:
                margin = max_far - far
                warnings.append(
                    f"FAR {far:.2f} is very close to maximum {max_far}, "
                    f"only {margin:.2f} margin ({margin * plot_area:.1f}m²)"
                )
        else:
            # Typical FAR limits if not specified
            default_max_far = 1.5  # Common for residential
            if far > default_max_far:
                warnings.append(
                    f"FAR {far:.2f} exceeds typical maximum {default_max_far} for residential"
                )

        # Breakdown by floor type (if provided)
        residential_area = building_data.get("residential_area_m2", 0)
        commercial_area = building_data.get("commercial_area_m2", 0)
        service_area = building_data.get("service_area_m2", 0)

        if residential_area or commercial_area or service_area:
            evidence["residential_area_m2"] = residential_area
            evidence["commercial_area_m2"] = commercial_area
            evidence["service_area_m2"] = service_area

            calculated_total = residential_area + commercial_area + service_area
            if abs(calculated_total - total_floor_area) > 1:  # 1m² tolerance
                warnings.append(
                    f"Sum of area breakdown ({calculated_total}m²) doesn't match "
                    f"total floor area ({total_floor_area}m²)"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class ZonParking005(BuildingRule):
    """ZON-PARKING-005: Required parking spaces per local ordinances"""

    def __init__(self):
        super().__init__(
            rule_id="ZON-PARKING-005",
            name_he="דרישות חניה",
            name_en="Required parking spaces",
            category=RuleCategory.ZONING,
            severity=RuleSeverity.HIGH
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        parking_data = building_data.get("parking", {})

        # Provided parking spaces
        provided_spaces = parking_data.get("total_spaces", 0)
        evidence["provided_spaces"] = provided_spaces

        # Calculate required parking based on use type and area
        required_spaces = calculate_parking_requirement(
            building_data.get("total_floor_area_m2", 0),
            building_data.get("use_type", "residential"),
            building_data.get("num_units", 0)
        )
        evidence["required_spaces"] = required_spaces
        evidence["calculation_basis"] = self._get_parking_standard(building_data.get("use_type", "residential"))

        if provided_spaces < required_spaces:
            shortage = required_spaces - provided_spaces
            violations.append(
                f"Parking spaces {provided_spaces} below required {required_spaces} "
                f"(shortage: {shortage} spaces)"
            )
        elif provided_spaces < required_spaces + 2:
            warnings.append(
                f"Parking spaces {provided_spaces} barely meets requirement of {required_spaces}, "
                f"consider adding buffer"
            )

        # Accessible parking spaces (minimum 5% per Israeli regulations)
        accessible_spaces = parking_data.get("accessible_spaces", 0)
        min_accessible = max(1, int(provided_spaces * 0.05))  # At least 1, or 5%
        evidence["accessible_spaces"] = accessible_spaces
        evidence["min_accessible_spaces"] = min_accessible

        if accessible_spaces < min_accessible:
            violations.append(
                f"Accessible parking spaces {accessible_spaces} below minimum {min_accessible} "
                f"(5% of total, minimum 1)"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)

    def _get_parking_standard(self, use_type: str) -> str:
        """Get parking standard description for evidence"""
        standards = {
            "residential": "1.0-1.5 spaces per unit",
            "office": "1 space per 40m²",
            "commercial": "1 space per 50m²",
            "retail": "1 space per 30m²",
            "restaurant": "1 space per 20m²"
        }
        return standards.get(use_type, "Standard rates per local ordinance")


# ============================================================================
# SAFETY RULES (5)
# ============================================================================

class SafFire001(BuildingRule):
    """SAF-FIRE-001: Fire suppression requirements per SI 1220"""

    def __init__(self):
        super().__init__(
            rule_id="SAF-FIRE-001",
            name_he="דרישות כיבוי אש",
            name_en="Fire suppression requirements",
            category=RuleCategory.SAFETY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        safety_data = building_data.get("safety", {})
        fire_data = safety_data.get("fire_suppression", {})

        num_floors = building_data.get("num_floors", 0)
        building_height = building_data.get("height_m", 0)
        building_use = building_data.get("use_type", "residential")

        evidence["num_floors"] = num_floors
        evidence["building_height_m"] = building_height
        evidence["building_use"] = building_use

        # Sprinkler system required for buildings > 4 floors or > 12m (SI 1220)
        has_sprinklers = fire_data.get("has_sprinkler_system", False)
        evidence["has_sprinkler_system"] = has_sprinklers

        if num_floors > 4 or building_height > 12:
            if not has_sprinklers:
                violations.append(
                    f"Sprinkler system required for buildings with {num_floors} floors "
                    f"or height {building_height}m (SI 1220 Part 4)"
                )

        # Fire extinguishers required on every floor
        has_extinguishers = fire_data.get("has_fire_extinguishers", False)
        evidence["has_fire_extinguishers"] = has_extinguishers

        if not has_extinguishers:
            violations.append("Fire extinguishers required on every floor (SI 1220)")

        # Fire alarm system required for multi-family or commercial
        has_fire_alarm = fire_data.get("has_fire_alarm", False)
        evidence["has_fire_alarm"] = has_fire_alarm

        if building_use in ["residential", "commercial", "office", "assembly"] and num_floors > 2:
            if not has_fire_alarm:
                violations.append(
                    f"Fire alarm system required for {building_use} building with {num_floors} floors "
                    f"(SI 1220)"
                )

        # Fire-rated doors and walls
        has_fire_rated_elements = fire_data.get("has_fire_rated_elements", False)
        evidence["has_fire_rated_elements"] = has_fire_rated_elements

        if num_floors > 2 and not has_fire_rated_elements:
            warnings.append(
                "Fire-rated doors and walls recommended for multi-floor buildings"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class SafEvac002(BuildingRule):
    """SAF-EVAC-002: Emergency exits per SI 1220"""

    def __init__(self):
        super().__init__(
            rule_id="SAF-EVAC-002",
            name_he="יציאות חירום",
            name_en="Emergency exits",
            category=RuleCategory.SAFETY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        safety_data = building_data.get("safety", {})
        evac_data = safety_data.get("evacuation", {})

        num_floors = building_data.get("num_floors", 0)
        floor_area = building_data.get("typical_floor_area_m2", 0)
        occupancy = building_data.get("max_occupancy", 0)

        evidence["num_floors"] = num_floors
        evidence["floor_area_m2"] = floor_area
        evidence["max_occupancy"] = occupancy

        # Number of emergency exits
        num_exits = evac_data.get("num_emergency_exits", 0)
        evidence["num_emergency_exits"] = num_exits

        # Minimum 2 exits for buildings > 2 floors or occupancy > 50 (SI 1220)
        if num_floors > 2 or occupancy > 50:
            if num_exits < 2:
                violations.append(
                    f"Minimum 2 emergency exits required for {num_floors} floors "
                    f"or occupancy {occupancy} (SI 1220 Part 3)"
                )
        elif num_exits < 1:
            violations.append("At least 1 emergency exit required")

        # Exit width (minimum 90cm per exit, SI 1220)
        exit_widths = evac_data.get("exit_widths_cm", [])
        evidence["exit_widths_cm"] = exit_widths

        for i, width in enumerate(exit_widths):
            if width < 90:
                violations.append(
                    f"Emergency exit {i+1} width {width}cm below minimum 90cm (SI 1220)"
                )

        # Maximum travel distance to exit (30m for residential, SI 1220)
        max_travel_distance = evac_data.get("max_travel_distance_m", 0)
        evidence["max_travel_distance_m"] = max_travel_distance

        max_allowed = 30  # 30m for residential
        if building_data.get("use_type") == "assembly":
            max_allowed = 20  # Stricter for assembly

        if max_travel_distance > max_allowed:
            violations.append(
                f"Maximum travel distance {max_travel_distance}m exceeds limit {max_allowed}m "
                f"(SI 1220)"
            )

        # Emergency lighting on exit routes
        has_emergency_lighting = evac_data.get("has_emergency_lighting", False)
        evidence["has_emergency_lighting"] = has_emergency_lighting

        if not has_emergency_lighting and num_floors > 2:
            violations.append("Emergency lighting required on exit routes (SI 1220)")

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class SafStair003(BuildingRule):
    """SAF-STAIR-003: Stairway dimensions per SI 1142"""

    def __init__(self):
        super().__init__(
            rule_id="SAF-STAIR-003",
            name_he="מידות חדר מדרגות",
            name_en="Stairway dimensions",
            category=RuleCategory.SAFETY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        safety_data = building_data.get("safety", {})
        stairs_data = safety_data.get("stairways", [])

        if not stairs_data:
            violations.append("No stairway data provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        for i, stair in enumerate(stairs_data):
            stair_id = stair.get("id", f"Stairway-{i+1}")

            # Tread depth (minimum 25cm, SI 1142)
            tread_depth = stair.get("tread_depth_cm", 0)
            evidence[f"{stair_id}_tread_depth_cm"] = tread_depth

            if tread_depth < 25:
                violations.append(
                    f"{stair_id}: Tread depth {tread_depth}cm below minimum 25cm (SI 1142)"
                )

            # Riser height (maximum 19cm, SI 1142)
            riser_height = stair.get("riser_height_cm", 0)
            evidence[f"{stair_id}_riser_height_cm"] = riser_height

            if riser_height > 19:
                violations.append(
                    f"{stair_id}: Riser height {riser_height}cm exceeds maximum 19cm (SI 1142)"
                )
            elif riser_height < 12:
                warnings.append(
                    f"{stair_id}: Riser height {riser_height}cm is unusually low"
                )

            # Stairway width (minimum 120cm, SI 1142)
            width = stair.get("width_cm", 0)
            evidence[f"{stair_id}_width_cm"] = width

            if width < 120:
                violations.append(
                    f"{stair_id}: Width {width}cm below minimum 120cm (SI 1142)"
                )

            # Headroom (minimum 210cm, SI 1142)
            headroom = stair.get("headroom_cm", 0)
            evidence[f"{stair_id}_headroom_cm"] = headroom

            if headroom < 210:
                violations.append(
                    f"{stair_id}: Headroom {headroom}cm below minimum 210cm (SI 1142)"
                )

            # Landing depth (minimum equal to stairway width)
            landing_depth = stair.get("landing_depth_cm", 0)
            evidence[f"{stair_id}_landing_depth_cm"] = landing_depth

            if landing_depth < width:
                warnings.append(
                    f"{stair_id}: Landing depth {landing_depth}cm should be at least "
                    f"equal to width {width}cm"
                )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class SafRail004(BuildingRule):
    """SAF-RAIL-004: Safety railings per SI 1142"""

    def __init__(self):
        super().__init__(
            rule_id="SAF-RAIL-004",
            name_he="מעקות בטיחות",
            name_en="Safety railings",
            category=RuleCategory.SAFETY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        safety_data = building_data.get("safety", {})
        railings_data = safety_data.get("railings", {})

        # Balcony railings
        balcony_railing_height = railings_data.get("balcony_height_cm", 0)
        evidence["balcony_railing_height_cm"] = balcony_railing_height

        # Minimum 110cm for balconies (SI 1142)
        if balcony_railing_height > 0 and balcony_railing_height < 110:
            violations.append(
                f"Balcony railing height {balcony_railing_height}cm below minimum 110cm (SI 1142)"
            )

        # Stairway railings
        stair_railing_height = railings_data.get("stair_height_cm", 0)
        evidence["stair_railing_height_cm"] = stair_railing_height

        # Minimum 90cm for stairs (SI 1142)
        if stair_railing_height > 0 and stair_railing_height < 90:
            violations.append(
                f"Stairway railing height {stair_railing_height}cm below minimum 90cm (SI 1142)"
            )

        # Railing spacing (maximum 12cm between bars)
        bar_spacing = railings_data.get("bar_spacing_cm", 0)
        evidence["bar_spacing_cm"] = bar_spacing

        if bar_spacing > 12:
            violations.append(
                f"Railing bar spacing {bar_spacing}cm exceeds maximum 12cm (SI 1142)"
            )

        # Railing strength (minimum 1.5 kN horizontal load)
        railing_load_capacity = railings_data.get("load_capacity_kn", 0)
        evidence["railing_load_capacity_kn"] = railing_load_capacity

        if railing_load_capacity > 0 and railing_load_capacity < 1.5:
            violations.append(
                f"Railing load capacity {railing_load_capacity}kN below minimum 1.5kN (SI 1142)"
            )

        # Roof access railings
        has_roof_access = building_data.get("has_roof_access", False)
        has_roof_railing = railings_data.get("has_roof_railing", False)
        evidence["has_roof_access"] = has_roof_access
        evidence["has_roof_railing"] = has_roof_railing

        if has_roof_access and not has_roof_railing:
            violations.append("Roof railing required for accessible roofs (SI 1142)")

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class SafLight005(BuildingRule):
    """SAF-LIGHT-005: Emergency lighting per SI 1220"""

    def __init__(self):
        super().__init__(
            rule_id="SAF-LIGHT-005",
            name_he="תאורת חירום",
            name_en="Emergency lighting",
            category=RuleCategory.SAFETY,
            severity=RuleSeverity.HIGH
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        safety_data = building_data.get("safety", {})
        lighting_data = safety_data.get("emergency_lighting", {})

        num_floors = building_data.get("num_floors", 0)
        building_use = building_data.get("use_type", "residential")

        evidence["num_floors"] = num_floors
        evidence["building_use"] = building_use

        # Emergency lighting required for buildings > 2 floors or public buildings
        has_emergency_lighting = lighting_data.get("has_system", False)
        evidence["has_emergency_lighting"] = has_emergency_lighting

        if num_floors > 2 or building_use in ["commercial", "office", "assembly"]:
            if not has_emergency_lighting:
                violations.append(
                    f"Emergency lighting required for {num_floors}-floor {building_use} building "
                    f"(SI 1220)"
                )

        # Battery backup duration (minimum 90 minutes, SI 1220)
        backup_duration = lighting_data.get("backup_duration_minutes", 0)
        evidence["backup_duration_minutes"] = backup_duration

        if has_emergency_lighting and backup_duration < 90:
            violations.append(
                f"Emergency lighting backup duration {backup_duration} minutes below minimum 90 minutes "
                f"(SI 1220)"
            )

        # Illumination level (minimum 1 lux on escape routes)
        min_illumination = lighting_data.get("min_illumination_lux", 0)
        evidence["min_illumination_lux"] = min_illumination

        if has_emergency_lighting and min_illumination < 1:
            violations.append(
                f"Emergency lighting illumination {min_illumination} lux below minimum 1 lux "
                f"(SI 1220)"
            )

        # Exit signs
        has_exit_signs = lighting_data.get("has_exit_signs", False)
        evidence["has_exit_signs"] = has_exit_signs

        if num_floors > 2 and not has_exit_signs:
            warnings.append("Illuminated exit signs recommended for multi-floor buildings")

        # Coverage of escape routes
        escape_route_coverage = lighting_data.get("escape_route_coverage_percent", 0)
        evidence["escape_route_coverage_percent"] = escape_route_coverage

        if has_emergency_lighting and escape_route_coverage < 100:
            violations.append(
                f"Emergency lighting must cover 100% of escape routes, current coverage: "
                f"{escape_route_coverage}%"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


# ============================================================================
# ACCESSIBILITY RULES (3)
# ============================================================================

class AccRamp001(BuildingRule):
    """ACC-RAMP-001: Ramp slope per Israeli accessibility law"""

    def __init__(self):
        super().__init__(
            rule_id="ACC-RAMP-001",
            name_he="שיפוע רמפה",
            name_en="Ramp slope",
            category=RuleCategory.ACCESSIBILITY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        accessibility_data = building_data.get("accessibility", {})
        ramps_data = accessibility_data.get("ramps", [])

        if not ramps_data:
            # Ramps only required if there are level changes
            has_level_changes = building_data.get("has_level_changes", False)
            if has_level_changes:
                violations.append("Ramp required for level changes (Israeli accessibility law)")
            return ValidationResult(self.rule_id, not has_level_changes, violations, warnings,
                                  evidence, self.severity)

        for i, ramp in enumerate(ramps_data):
            ramp_id = ramp.get("id", f"Ramp-{i+1}")

            # Calculate slope
            slope_percent = verify_ramp_slope(ramp)
            evidence[f"{ramp_id}_slope_percent"] = slope_percent

            # Maximum 8.33% (1:12) slope for accessible ramps
            max_slope = 8.33
            if slope_percent > max_slope:
                violations.append(
                    f"{ramp_id}: Slope {slope_percent:.2f}% exceeds maximum {max_slope}% "
                    f"(Israeli accessibility law)"
                )
            elif slope_percent > 6.0:
                warnings.append(
                    f"{ramp_id}: Slope {slope_percent:.2f}% is steep, consider gentler slope"
                )

            # Ramp width (minimum 90cm)
            width = ramp.get("width_cm", 0)
            evidence[f"{ramp_id}_width_cm"] = width

            if width < 90:
                violations.append(
                    f"{ramp_id}: Width {width}cm below minimum 90cm"
                )

            # Landing requirements
            run_length = ramp.get("run_length_m", 0)
            has_landing = ramp.get("has_landing", False)
            evidence[f"{ramp_id}_run_length_m"] = run_length
            evidence[f"{ramp_id}_has_landing"] = has_landing

            # Landing required every 9m of run
            if run_length > 9 and not has_landing:
                violations.append(
                    f"{ramp_id}: Landing required for run length {run_length}m (max 9m between landings)"
                )

            # Handrails
            has_handrails = ramp.get("has_handrails", False)
            evidence[f"{ramp_id}_has_handrails"] = has_handrails

            if not has_handrails:
                violations.append(f"{ramp_id}: Handrails required on both sides")

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class AccDoor002(BuildingRule):
    """ACC-DOOR-002: Accessible door width per Israeli accessibility law"""

    def __init__(self):
        super().__init__(
            rule_id="ACC-DOOR-002",
            name_he="רוחב דלת נגישה",
            name_en="Accessible door width",
            category=RuleCategory.ACCESSIBILITY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        accessibility_data = building_data.get("accessibility", {})
        doors_data = accessibility_data.get("doors", [])

        if not doors_data:
            violations.append("No accessible door data provided")
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        for i, door in enumerate(doors_data):
            door_id = door.get("id", f"Door-{i+1}")
            door_type = door.get("type", "entry")  # entry, interior, bathroom

            # Clear width (minimum 80cm for interior, 90cm for entry)
            clear_width = door.get("clear_width_cm", 0)
            evidence[f"{door_id}_clear_width_cm"] = clear_width
            evidence[f"{door_id}_type"] = door_type

            min_width = 90 if door_type == "entry" else 80
            if clear_width < min_width:
                violations.append(
                    f"{door_id}: Clear width {clear_width}cm below minimum {min_width}cm "
                    f"for {door_type} door (Israeli accessibility law)"
                )

            # Threshold height (maximum 2cm)
            threshold_height = door.get("threshold_height_cm", 0)
            evidence[f"{door_id}_threshold_height_cm"] = threshold_height

            if threshold_height > 2:
                violations.append(
                    f"{door_id}: Threshold height {threshold_height}cm exceeds maximum 2cm"
                )

            # Maneuvering clearance
            maneuvering_space = door.get("maneuvering_space_cm", 0)
            evidence[f"{door_id}_maneuvering_space_cm"] = maneuvering_space

            if maneuvering_space < 150:
                violations.append(
                    f"{door_id}: Maneuvering space {maneuvering_space}cm below minimum 150cm"
                )

            # Door hardware (lever handles required)
            has_lever_handle = door.get("has_lever_handle", False)
            evidence[f"{door_id}_has_lever_handle"] = has_lever_handle

            if not has_lever_handle:
                warnings.append(
                    f"{door_id}: Lever handles recommended for accessibility"
                )

            # Automatic door closer (required for fire doors)
            is_fire_door = door.get("is_fire_door", False)
            has_auto_closer = door.get("has_auto_closer", False)

            if is_fire_door and has_auto_closer:
                # Check closing force (maximum 22N)
                closing_force = door.get("closing_force_n", 0)
                evidence[f"{door_id}_closing_force_n"] = closing_force

                if closing_force > 22:
                    violations.append(
                        f"{door_id}: Closing force {closing_force}N exceeds maximum 22N"
                    )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class AccElev003(BuildingRule):
    """ACC-ELEV-003: Elevator requirements per Israeli accessibility law"""

    def __init__(self):
        super().__init__(
            rule_id="ACC-ELEV-003",
            name_he="דרישות מעלית",
            name_en="Elevator requirements",
            category=RuleCategory.ACCESSIBILITY,
            severity=RuleSeverity.CRITICAL
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        accessibility_data = building_data.get("accessibility", {})
        elevator_data = accessibility_data.get("elevator", {})

        num_floors = building_data.get("num_floors", 0)
        evidence["num_floors"] = num_floors

        # Elevator required for buildings > 3 floors (Israeli accessibility law)
        has_elevator = elevator_data.get("has_elevator", False)
        evidence["has_elevator"] = has_elevator

        if num_floors > 3 and not has_elevator:
            violations.append(
                f"Elevator required for building with {num_floors} floors (>3) "
                f"(Israeli accessibility law)"
            )
            return ValidationResult(self.rule_id, False, violations, warnings, evidence, self.severity)

        if not has_elevator:
            # No elevator, but not required
            return ValidationResult(self.rule_id, True, violations, warnings, evidence, self.severity)

        # Elevator car dimensions (minimum 110cm x 140cm)
        car_width = elevator_data.get("car_width_cm", 0)
        car_depth = elevator_data.get("car_depth_cm", 0)
        evidence["car_width_cm"] = car_width
        evidence["car_depth_cm"] = car_depth

        if car_width < 110 or car_depth < 140:
            violations.append(
                f"Elevator car dimensions {car_width}x{car_depth}cm below minimum 110x140cm "
                f"(Israeli accessibility law)"
            )

        # Door width (minimum 80cm)
        door_width = elevator_data.get("door_width_cm", 0)
        evidence["door_width_cm"] = door_width

        if door_width < 80:
            violations.append(
                f"Elevator door width {door_width}cm below minimum 80cm"
            )

        # Door opening time (minimum 3 seconds)
        door_open_time = elevator_data.get("door_open_time_seconds", 0)
        evidence["door_open_time_seconds"] = door_open_time

        if door_open_time < 3:
            warnings.append(
                f"Elevator door open time {door_open_time}s below recommended 3s"
            )

        # Braille and tactile controls
        has_braille_controls = elevator_data.get("has_braille_controls", False)
        evidence["has_braille_controls"] = has_braille_controls

        if not has_braille_controls:
            violations.append("Elevator must have Braille and tactile controls")

        # Audio announcements
        has_audio_announcements = elevator_data.get("has_audio_announcements", False)
        evidence["has_audio_announcements"] = has_audio_announcements

        if not has_audio_announcements:
            violations.append("Elevator must have audio floor announcements")

        # Control button height (90-120cm from floor)
        button_height = elevator_data.get("button_height_cm", 0)
        evidence["button_height_cm"] = button_height

        if button_height < 90 or button_height > 120:
            violations.append(
                f"Elevator control button height {button_height}cm outside range 90-120cm"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


# ============================================================================
# ENVIRONMENTAL RULES (2)
# ============================================================================

class EnvEnergy001(BuildingRule):
    """ENV-ENERGY-001: Green building standard (SI 5282)"""

    def __init__(self):
        super().__init__(
            rule_id="ENV-ENERGY-001",
            name_he="תקן בנייה ירוקה (ת\"י 5282)",
            name_en="Green building standard (SI 5282)",
            category=RuleCategory.ENVIRONMENTAL,
            severity=RuleSeverity.HIGH
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        environmental_data = building_data.get("environmental", {})
        energy_data = environmental_data.get("energy", {})

        # SI 5282 compliance level
        si5282_level = energy_data.get("si5282_level", "")
        evidence["si5282_level"] = si5282_level

        valid_levels = ["basic", "intermediate", "advanced", "platinum"]
        if si5282_level and si5282_level not in valid_levels:
            warnings.append(
                f"SI 5282 level '{si5282_level}' not recognized. Valid: {', '.join(valid_levels)}"
            )

        # Thermal insulation (U-values)
        wall_u_value = energy_data.get("wall_u_value", 0)
        roof_u_value = energy_data.get("roof_u_value", 0)
        window_u_value = energy_data.get("window_u_value", 0)

        evidence["wall_u_value"] = wall_u_value
        evidence["roof_u_value"] = roof_u_value
        evidence["window_u_value"] = window_u_value

        # Maximum U-values per SI 5282 (W/m²K)
        if wall_u_value > 0.5:
            violations.append(
                f"Wall U-value {wall_u_value} W/m²K exceeds maximum 0.5 W/m²K (SI 5282)"
            )
        if roof_u_value > 0.35:
            violations.append(
                f"Roof U-value {roof_u_value} W/m²K exceeds maximum 0.35 W/m²K (SI 5282)"
            )
        if window_u_value > 2.0:
            violations.append(
                f"Window U-value {window_u_value} W/m²K exceeds maximum 2.0 W/m²K (SI 5282)"
            )

        # Solar water heating (required for residential, SI 5282)
        has_solar_water = energy_data.get("has_solar_water_heating", False)
        evidence["has_solar_water_heating"] = has_solar_water

        if building_data.get("use_type") == "residential" and not has_solar_water:
            violations.append(
                "Solar water heating required for residential buildings (SI 5282)"
            )

        # Energy-efficient lighting
        led_coverage_percent = energy_data.get("led_coverage_percent", 0)
        evidence["led_coverage_percent"] = led_coverage_percent

        if led_coverage_percent < 80:
            warnings.append(
                f"LED coverage {led_coverage_percent}% below recommended 80% (SI 5282)"
            )

        # Renewable energy
        renewable_capacity_kw = energy_data.get("renewable_capacity_kw", 0)
        evidence["renewable_capacity_kw"] = renewable_capacity_kw

        floor_area = building_data.get("total_floor_area_m2", 0)
        if floor_area > 0:
            renewable_per_m2 = renewable_capacity_kw / floor_area
            evidence["renewable_kw_per_m2"] = round(renewable_per_m2, 4)

            # Recommended: 0.01 kW/m² (10W/m²) minimum
            if renewable_per_m2 < 0.01:
                warnings.append(
                    f"Renewable energy capacity {renewable_per_m2:.4f} kW/m² below "
                    f"recommended 0.01 kW/m² (SI 5282)"
                )

        # Water conservation
        has_low_flow_fixtures = energy_data.get("has_low_flow_fixtures", False)
        evidence["has_low_flow_fixtures"] = has_low_flow_fixtures

        if not has_low_flow_fixtures:
            warnings.append("Low-flow water fixtures recommended (SI 5282)")

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


class EnvNoise002(BuildingRule):
    """ENV-NOISE-002: Acoustic insulation per SI 1004"""

    def __init__(self):
        super().__init__(
            rule_id="ENV-NOISE-002",
            name_he="בידוד אקוסטי",
            name_en="Acoustic insulation",
            category=RuleCategory.ENVIRONMENTAL,
            severity=RuleSeverity.MEDIUM
        )

    def validate(self, data: Dict[str, Any]) -> ValidationResult:
        violations = []
        warnings = []
        evidence = {}

        building_data = data.get("building", {})
        environmental_data = building_data.get("environmental", {})
        acoustic_data = environmental_data.get("acoustic", {})

        # Airborne sound insulation (Rw - weighted sound reduction index)
        wall_rw = acoustic_data.get("wall_rw_db", 0)
        floor_rw = acoustic_data.get("floor_rw_db", 0)

        evidence["wall_rw_db"] = wall_rw
        evidence["floor_rw_db"] = floor_rw

        # Minimum Rw values per SI 1004
        # Walls between apartments: 52 dB
        # Floors between apartments: 52 dB
        min_wall_rw = 52
        min_floor_rw = 52

        if wall_rw > 0 and wall_rw < min_wall_rw:
            violations.append(
                f"Wall sound insulation Rw {wall_rw}dB below minimum {min_wall_rw}dB (SI 1004)"
            )
        elif wall_rw > 0 and wall_rw < min_wall_rw + 3:
            warnings.append(
                f"Wall sound insulation Rw {wall_rw}dB is minimal, recommend ≥{min_wall_rw + 3}dB"
            )

        if floor_rw > 0 and floor_rw < min_floor_rw:
            violations.append(
                f"Floor sound insulation Rw {floor_rw}dB below minimum {min_floor_rw}dB (SI 1004)"
            )

        # Impact sound insulation (Ln - normalized impact sound pressure level)
        floor_ln = acoustic_data.get("floor_ln_db", 0)
        evidence["floor_ln_db"] = floor_ln

        # Maximum Ln per SI 1004: 58 dB (lower is better)
        max_ln = 58
        if floor_ln > max_ln:
            violations.append(
                f"Floor impact sound Ln {floor_ln}dB exceeds maximum {max_ln}dB (SI 1004)"
            )

        # Facade sound insulation (protection from external noise)
        facade_rw = acoustic_data.get("facade_rw_db", 0)
        evidence["facade_rw_db"] = facade_rw

        # Get external noise level
        external_noise = data.get("location", {}).get("external_noise_db", 0)
        evidence["external_noise_db"] = external_noise

        # Required facade insulation based on external noise (SI 1004)
        # Target: indoor noise ≤ 35 dB
        target_indoor = 35
        if external_noise > 0:
            required_facade_rw = external_noise - target_indoor
            evidence["required_facade_rw_db"] = required_facade_rw

            if facade_rw < required_facade_rw:
                violations.append(
                    f"Facade sound insulation Rw {facade_rw}dB below required {required_facade_rw}dB "
                    f"for external noise {external_noise}dB (SI 1004)"
                )

        # Window acoustic performance
        window_rw = acoustic_data.get("window_rw_db", 0)
        evidence["window_rw_db"] = window_rw

        # Minimum window Rw: 30 dB for residential
        min_window_rw = 30
        if window_rw > 0 and window_rw < min_window_rw:
            warnings.append(
                f"Window sound insulation Rw {window_rw}dB below recommended {min_window_rw}dB"
            )

        passed = len(violations) == 0
        return ValidationResult(self.rule_id, passed, violations, warnings, evidence, self.severity)


# ============================================================================
# RULES ENGINE
# ============================================================================

class RulesEngine:
    """Main rules engine for building permit validation"""

    def __init__(self):
        self.rules: Dict[str, BuildingRule] = {}
        self.load_rules()
        logger.info(f"RulesEngine initialized with {len(self.rules)} rules")

    def load_rules(self) -> None:
        """Load all validation rules"""
        rule_classes = [
            # Structural (5)
            StrLoad001, StrFound002, StrColumn003, StrBeam004, StrSlab005,
            # Zoning (5)
            ZonSetback001, ZonHeight002, ZonCoverage003, ZonFar004, ZonParking005,
            # Safety (5)
            SafFire001, SafEvac002, SafStair003, SafRail004, SafLight005,
            # Accessibility (3)
            AccRamp001, AccDoor002, AccElev003,
            # Environmental (2)
            EnvEnergy001, EnvNoise002
        ]

        for rule_class in rule_classes:
            rule = rule_class()
            self.rules[rule.rule_id] = rule

        logger.info(f"Loaded {len(self.rules)} rules across {len(RuleCategory)} categories")

    def validate_all(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate all rules against provided data

        Args:
            data: Building and plot data dictionary

        Returns:
            Dictionary with validation results and summary
        """
        logger.info("Starting validation of all rules")
        results = []

        for rule_id, rule in self.rules.items():
            try:
                result = rule.validate(data)
                results.append(result.to_dict())
                logger.debug(f"{rule_id}: {'PASS' if result.passed else 'FAIL'}")
            except Exception as e:
                logger.error(f"Error validating {rule_id}: {str(e)}", exc_info=True)
                results.append({
                    "rule_id": rule_id,
                    "passed": False,
                    "violations": [f"Validation error: {str(e)}"],
                    "warnings": [],
                    "evidence": {},
                    "severity": RuleSeverity.CRITICAL.value
                })

        summary = self._generate_summary(results)
        logger.info(f"Validation complete: {summary['total_passed']}/{summary['total_rules']} passed")

        return {
            "results": results,
            "summary": summary,
            "timestamp": self._get_timestamp()
        }

    def validate_by_category(self, category: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate rules in a specific category

        Args:
            category: Category name (structural, zoning, safety, accessibility, environmental)
            data: Building and plot data dictionary

        Returns:
            Dictionary with validation results for the category
        """
        try:
            cat_enum = RuleCategory(category.lower())
        except ValueError:
            logger.error(f"Invalid category: {category}")
            return {
                "error": f"Invalid category: {category}",
                "valid_categories": [c.value for c in RuleCategory]
            }

        logger.info(f"Validating category: {category}")
        results = []

        for rule_id, rule in self.rules.items():
            if rule.category == cat_enum:
                try:
                    result = rule.validate(data)
                    results.append(result.to_dict())
                except Exception as e:
                    logger.error(f"Error validating {rule_id}: {str(e)}", exc_info=True)
                    results.append({
                        "rule_id": rule_id,
                        "passed": False,
                        "violations": [f"Validation error: {str(e)}"],
                        "warnings": [],
                        "evidence": {},
                        "severity": RuleSeverity.CRITICAL.value
                    })

        summary = self._generate_summary(results)

        return {
            "category": category,
            "results": results,
            "summary": summary,
            "timestamp": self._get_timestamp()
        }

    def get_rule(self, rule_id: str) -> Optional[BuildingRule]:
        """Get a specific rule by ID"""
        return self.rules.get(rule_id)

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all available rules"""
        summary = {
            "total_rules": len(self.rules),
            "rules_by_category": {},
            "rules_by_severity": {},
            "rules_list": []
        }

        for rule in self.rules.values():
            # Count by category
            cat = rule.category.value
            summary["rules_by_category"][cat] = summary["rules_by_category"].get(cat, 0) + 1

            # Count by severity
            sev = rule.severity.value
            summary["rules_by_severity"][sev] = summary["rules_by_severity"].get(sev, 0) + 1

            # Add to list
            summary["rules_list"].append(rule.to_dict())

        return summary

    def _generate_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary statistics from validation results"""
        total_rules = len(results)
        total_passed = sum(1 for r in results if r["passed"])
        total_failed = total_rules - total_passed

        total_violations = sum(len(r["violations"]) for r in results)
        total_warnings = sum(len(r["warnings"]) for r in results)

        violations_by_severity = {}
        for result in results:
            if not result["passed"]:
                sev = result["severity"]
                violations_by_severity[sev] = violations_by_severity.get(sev, 0) + 1

        return {
            "total_rules": total_rules,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "pass_rate_percent": round((total_passed / total_rules * 100) if total_rules > 0 else 0, 2),
            "total_violations": total_violations,
            "total_warnings": total_warnings,
            "violations_by_severity": violations_by_severity
        }

    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def load_rules_from_json(file_path: str) -> Dict[str, Any]:
    """
    Load rules configuration from JSON file

    Args:
        file_path: Path to rules.json file

    Returns:
        Dictionary with rules configuration
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"Rules file not found: {file_path}")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing rules JSON: {str(e)}")
        return {}


def calculate_setback(plot_data: Dict[str, Any], building_data: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate building setbacks from property lines

    Args:
        plot_data: Plot/lot data
        building_data: Building data

    Returns:
        Dictionary with calculated setbacks for each direction
    """
    setbacks = {}

    building_footprint = building_data.get("footprint", {})
    plot_boundaries = plot_data.get("boundaries", {})

    # Calculate distance from building edges to plot boundaries
    # This would use actual coordinates in production
    for direction in ["north", "south", "east", "west"]:
        building_edge = building_footprint.get(f"{direction}_edge", 0)
        plot_boundary = plot_boundaries.get(f"{direction}_boundary", 0)
        setbacks[direction] = abs(plot_boundary - building_edge)

    return setbacks


def check_parking_requirement(floor_area: float, use_type: str, num_units: int = 0) -> int:
    """
    Calculate required parking spaces

    Args:
        floor_area: Total floor area in m²
        use_type: Building use type
        num_units: Number of residential units (for residential)

    Returns:
        Required number of parking spaces
    """
    return calculate_parking_requirement(floor_area, use_type, num_units)


def calculate_parking_requirement(floor_area: float, use_type: str, num_units: int = 0) -> int:
    """
    Calculate required parking spaces based on Israeli standards

    Args:
        floor_area: Total floor area in m²
        use_type: Building use type (residential, office, commercial, etc.)
        num_units: Number of residential units

    Returns:
        Required number of parking spaces
    """
    if use_type == "residential":
        # Residential: typically 1-1.5 spaces per unit
        if num_units > 0:
            return int(num_units * 1.2)  # 1.2 spaces per unit (average)
        else:
            # Estimate based on area (assuming 100m² per unit)
            estimated_units = floor_area / 100
            return int(estimated_units * 1.2)
    elif use_type == "office":
        # Office: 1 space per 40m²
        return int(floor_area / 40)
    elif use_type == "commercial" or use_type == "retail":
        # Commercial/Retail: 1 space per 30-50m²
        return int(floor_area / 40)
    elif use_type == "restaurant":
        # Restaurant: 1 space per 20m²
        return int(floor_area / 20)
    else:
        # Default: 1 space per 50m²
        return int(floor_area / 50)


def verify_ramp_slope(ramp_data: Dict[str, Any]) -> float:
    """
    Calculate ramp slope percentage

    Args:
        ramp_data: Dictionary with ramp dimensions (rise_cm, run_cm or rise_m, run_m)

    Returns:
        Slope as percentage
    """
    rise = ramp_data.get("rise_m", ramp_data.get("rise_cm", 0) / 100)
    run = ramp_data.get("run_m", ramp_data.get("run_cm", 0) / 100)

    if run == 0:
        return 100.0  # Vertical = 100% slope

    slope_ratio = rise / run
    slope_percent = slope_ratio * 100

    return slope_percent


# ============================================================================
# MODULE EXPORTS
# ============================================================================

__all__ = [
    'RulesEngine',
    'BuildingRule',
    'ValidationResult',
    'RuleCategory',
    'RuleSeverity',
    'load_rules_from_json',
    'calculate_setback',
    'check_parking_requirement',
    'calculate_parking_requirement',
    'verify_ramp_slope'
]
