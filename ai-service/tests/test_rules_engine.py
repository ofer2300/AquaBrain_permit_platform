"""
Rules Engine Tests
Comprehensive tests for all 20 building code validation rules.
"""

import pytest
from app.rules_engine import (
    RulesEngine, BuildingRule, ValidationResult,
    RuleCategory, RuleSeverity,
    StrLoad001, StrFound002, StrColumn003, StrBeam004, StrSlab005,
    ZonSetback001, ZonHeight002, ZonCoverage003, ZonFar004, ZonParking005,
    SafFire001, SafEvac002, SafStair003, SafRail004, SafLight005,
    AccRamp001, AccDoor002, AccElev003,
    EnvEnergy001, EnvNoise002,
    calculate_parking_requirement, verify_ramp_slope
)


class TestRulesEngineInitialization:
    """Test RulesEngine initialization and configuration"""

    def test_rules_engine_init(self, rules_engine):
        assert rules_engine is not None
        assert isinstance(rules_engine.rules, dict)

    def test_correct_number_of_rules(self, rules_engine):
        assert len(rules_engine.rules) == 20

    def test_rules_by_category(self, rules_engine):
        summary = rules_engine.get_summary()
        by_category = summary['rules_by_category']

        assert by_category['structural'] == 5
        assert by_category['zoning'] == 5
        assert by_category['safety'] == 5
        assert by_category['accessibility'] == 3
        assert by_category['environmental'] == 2

    def test_rules_by_severity(self, rules_engine):
        summary = rules_engine.get_summary()
        by_severity = summary['rules_by_severity']

        assert 'critical' in by_severity
        assert 'high' in by_severity
        assert by_severity['critical'] >= 15

    def test_get_rule_by_id(self, rules_engine):
        rule = rules_engine.get_rule('STR-LOAD-001')
        assert rule is not None
        assert isinstance(rule, BuildingRule)
        assert rule.rule_id == 'STR-LOAD-001'

    def test_get_nonexistent_rule(self, rules_engine):
        rule = rules_engine.get_rule('NONEXISTENT-001')
        assert rule is None


class TestStructuralRules:
    """Test all 5 structural rules (STR-*)"""

    def test_str_load_001_pass(self, sample_building_data):
        rule = StrLoad001()
        result = rule.validate(sample_building_data)

        assert result.passed is True
        assert len(result.violations) == 0
        assert result.rule_id == 'STR-LOAD-001'

    def test_str_load_001_low_dead_load(self):
        rule = StrLoad001()
        data = {
            "structural": {"dead_load_kn_m2": 3.0},
            "building": {"use_type": "residential"}
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Dead load" in v for v in result.violations)

    def test_str_load_001_low_live_load(self):
        rule = StrLoad001()
        data = {
            "structural": {
                "dead_load_kn_m2": 4.0,
                "live_load_kn_m2": 1.5,
                "wind_load_kn_m2": 0.8,
                "seismic_coefficient": 0.15
            },
            "building": {"use_type": "residential"},
            "location": {"seismic_zone": "moderate"}
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Live load" in v for v in result.violations)

    def test_str_found_002_pass(self, sample_building_data):
        rule = StrFound002()
        result = rule.validate(sample_building_data)

        assert result.passed is True
        assert len(result.violations) == 0

    def test_str_found_002_shallow_depth(self):
        rule = StrFound002()
        data = {
            "structural": {
                "foundation": {
                    "depth_m": 0.8,
                    "soil_type": "sand",
                    "bearing_capacity_kn_m2": 150
                }
            }
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("depth" in v.lower() for v in result.violations)

    def test_str_found_002_low_bearing_capacity(self):
        rule = StrFound002()
        data = {
            "structural": {
                "foundation": {
                    "depth_m": 1.5,
                    "soil_type": "sand",
                    "bearing_capacity_kn_m2": 80
                }
            }
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Bearing capacity" in v for v in result.violations)

    def test_str_column_003_pass(self, sample_building_data):
        rule = StrColumn003()
        result = rule.validate(sample_building_data)

        assert result.passed is True
        assert len(result.violations) == 0

    def test_str_column_003_small_dimensions(self):
        rule = StrColumn003()
        data = {
            "structural": {
                "columns": [
                    {"id": "Col-1", "width_cm": 20, "depth_cm": 20}
                ]
            },
            "building": {"num_floors": 1}
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("below minimum" in v for v in result.violations)

    def test_str_column_003_insufficient_area_for_floors(self):
        rule = StrColumn003()
        data = {
            "structural": {
                "columns": [
                    {"id": "Col-1", "width_cm": 25, "depth_cm": 25}
                ]
            },
            "building": {"num_floors": 5}
        }
        result = rule.validate(data)

        assert result.passed is False

    def test_str_beam_004_pass(self, sample_building_data):
        rule = StrBeam004()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_str_beam_004_narrow_beam(self):
        rule = StrBeam004()
        data = {
            "structural": {
                "beams": [
                    {"id": "Beam-1", "width_cm": 15, "height_cm": 40, "span_m": 4.0}
                ]
            }
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Width" in v for v in result.violations)

    def test_str_beam_004_short_height(self):
        rule = StrBeam004()
        data = {
            "structural": {
                "beams": [
                    {"id": "Beam-1", "width_cm": 25, "height_cm": 30, "span_m": 6.0}
                ]
            }
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Height" in v for v in result.violations)

    def test_str_slab_005_pass(self, sample_building_data):
        rule = StrSlab005()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_str_slab_005_thin_slab(self):
        rule = StrSlab005()
        data = {
            "structural": {
                "slabs": [
                    {"id": "Slab-1", "thickness_cm": 10, "span_m": 5.0, "type": "solid"}
                ]
            }
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Thickness" in v for v in result.violations)


class TestZoningRules:
    """Test all 5 zoning rules (ZON-*)"""

    def test_zon_setback_001_pass(self, sample_building_data):
        rule = ZonSetback001()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_zon_setback_001_insufficient_setback(self, failing_building_data):
        rule = ZonSetback001()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert len(result.violations) > 0
        assert any("setback" in v.lower() for v in result.violations)

    def test_zon_height_002_pass(self, sample_building_data):
        rule = ZonHeight002()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_zon_height_002_exceeds_max(self, failing_building_data):
        rule = ZonHeight002()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("height" in v.lower() or "floors" in v.lower() for v in result.violations)

    def test_zon_height_002_low_floor_height(self):
        rule = ZonHeight002()
        data = {
            "building": {"height_m": 10.0, "num_floors": 5},
            "plot": {"max_height_m": 15.0, "max_floors": 6}
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("floor height" in v.lower() for v in result.violations)

    def test_zon_coverage_003_pass(self, sample_building_data):
        rule = ZonCoverage003()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_zon_coverage_003_exceeds_max(self, failing_building_data):
        rule = ZonCoverage003()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("coverage" in v.lower() for v in result.violations)

    def test_zon_far_004_pass(self, sample_building_data):
        rule = ZonFar004()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_zon_far_004_exceeds_max(self, failing_building_data):
        rule = ZonFar004()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("FAR" in v for v in result.violations)

    def test_zon_parking_005_pass(self, sample_building_data):
        rule = ZonParking005()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_zon_parking_005_insufficient_spaces(self, failing_building_data):
        rule = ZonParking005()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("Parking spaces" in v or "accessible" in v.lower() for v in result.violations)


class TestSafetyRules:
    """Test all 5 safety rules (SAF-*)"""

    def test_saf_fire_001_pass(self, sample_building_data):
        rule = SafFire001()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_saf_fire_001_missing_sprinklers(self, failing_building_data):
        rule = SafFire001()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("sprinkler" in v.lower() or "fire" in v.lower() for v in result.violations)

    def test_saf_evac_002_pass(self, sample_building_data):
        rule = SafEvac002()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_saf_evac_002_insufficient_exits(self, failing_building_data):
        rule = SafEvac002()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("exit" in v.lower() for v in result.violations)

    def test_saf_stair_003_pass(self, sample_building_data):
        rule = SafStair003()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_saf_stair_003_violations(self, failing_building_data):
        rule = SafStair003()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert len(result.violations) >= 3

    def test_saf_rail_004_pass(self, sample_building_data):
        rule = SafRail004()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_saf_rail_004_low_railing(self, failing_building_data):
        rule = SafRail004()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("railing" in v.lower() for v in result.violations)

    def test_saf_light_005_pass(self, sample_building_data):
        rule = SafLight005()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_saf_light_005_missing_system(self, failing_building_data):
        rule = SafLight005()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("emergency lighting" in v.lower() for v in result.violations)


class TestAccessibilityRules:
    """Test all 3 accessibility rules (ACC-*)"""

    def test_acc_ramp_001_pass(self, sample_building_data):
        rule = AccRamp001()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_acc_ramp_001_no_ramp_required(self):
        rule = AccRamp001()
        data = {"building": {"has_level_changes": False}}
        result = rule.validate(data)

        assert result.passed is True

    def test_acc_ramp_001_steep_slope(self):
        rule = AccRamp001()
        data = {
            "building": {"has_level_changes": True, "accessibility": {
                "ramps": [
                    {
                        "id": "Ramp-1",
                        "rise_m": 1.0,
                        "run_m": 10.0,
                        "width_cm": 100,
                        "run_length_m": 10.0,
                        "has_landing": True,
                        "has_handrails": True
                    }
                ]
            }}
        }
        result = rule.validate(data)

        assert result.passed is False
        assert any("Slope" in v for v in result.violations)

    def test_acc_door_002_pass(self, sample_building_data):
        rule = AccDoor002()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_acc_door_002_narrow_door(self, failing_building_data):
        rule = AccDoor002()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("width" in v.lower() or "threshold" in v.lower() for v in result.violations)

    def test_acc_elev_003_pass(self, sample_building_data):
        rule = AccElev003()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_acc_elev_003_missing_elevator(self, failing_building_data):
        rule = AccElev003()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("Elevator required" in v for v in result.violations)

    def test_acc_elev_003_not_required_low_rise(self):
        rule = AccElev003()
        data = {"building": {"num_floors": 2, "accessibility": {"elevator": {"has_elevator": False}}}}
        result = rule.validate(data)

        assert result.passed is True


class TestEnvironmentalRules:
    """Test all 2 environmental rules (ENV-*)"""

    def test_env_energy_001_pass(self, sample_building_data):
        rule = EnvEnergy001()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_env_energy_001_poor_insulation(self, failing_building_data):
        rule = EnvEnergy001()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("U-value" in v or "solar" in v.lower() for v in result.violations)

    def test_env_noise_002_pass(self, sample_building_data):
        rule = EnvNoise002()
        result = rule.validate(sample_building_data)

        assert result.passed is True

    def test_env_noise_002_poor_insulation(self, failing_building_data):
        rule = EnvNoise002()
        result = rule.validate(failing_building_data)

        assert result.passed is False
        assert any("sound insulation" in v.lower() or "Rw" in v or "Ln" in v for v in result.violations)


class TestRulesEngineValidation:
    """Test RulesEngine validate_all and validate_by_category methods"""

    def test_validate_all_passing_data(self, rules_engine, sample_building_data):
        results = rules_engine.validate_all(sample_building_data)

        assert 'results' in results
        assert 'summary' in results
        assert results['summary']['total_rules'] == 20

        passed_count = results['summary']['total_passed']
        assert passed_count >= 18

    def test_validate_all_failing_data(self, rules_engine, failing_building_data):
        results = rules_engine.validate_all(failing_building_data)

        assert results['summary']['total_failed'] > 10
        assert results['summary']['pass_rate_percent'] < 50

    def test_validate_by_category_structural(self, rules_engine, sample_building_data):
        results = rules_engine.validate_by_category('structural', sample_building_data)

        assert 'category' in results
        assert results['category'] == 'structural'
        assert results['summary']['total_rules'] == 5

    def test_validate_by_category_safety(self, rules_engine, failing_building_data):
        results = rules_engine.validate_by_category('safety', failing_building_data)

        assert results['summary']['total_rules'] == 5
        assert results['summary']['total_failed'] >= 4

    def test_validate_by_category_invalid(self, rules_engine, sample_building_data):
        results = rules_engine.validate_by_category('invalid_category', sample_building_data)

        assert 'error' in results
        assert 'valid_categories' in results

    def test_summary_statistics(self, rules_engine, sample_building_data):
        results = rules_engine.validate_all(sample_building_data)
        summary = results['summary']

        assert 'total_violations' in summary
        assert 'total_warnings' in summary
        assert 'violations_by_severity' in summary
        assert 'pass_rate_percent' in summary
        assert 0 <= summary['pass_rate_percent'] <= 100


class TestHelperFunctions:
    """Test helper utility functions"""

    def test_calculate_parking_requirement_residential(self):
        result = calculate_parking_requirement(1000.0, 'residential', 10)
        assert result == 12

    def test_calculate_parking_requirement_office(self):
        result = calculate_parking_requirement(800.0, 'office', 0)
        assert result == 20

    def test_calculate_parking_requirement_commercial(self):
        result = calculate_parking_requirement(600.0, 'commercial', 0)
        assert result == 15

    def test_verify_ramp_slope_valid(self):
        ramp_data = {"rise_m": 0.3, "run_m": 5.0}
        slope = verify_ramp_slope(ramp_data)

        assert slope == 6.0
        assert slope <= 8.33

    def test_verify_ramp_slope_steep(self):
        ramp_data = {"rise_m": 1.0, "run_m": 10.0}
        slope = verify_ramp_slope(ramp_data)

        assert slope == 10.0
        assert slope > 8.33

    def test_verify_ramp_slope_cm_units(self):
        ramp_data = {"rise_cm": 30, "run_cm": 500}
        slope = verify_ramp_slope(ramp_data)

        assert slope == 6.0


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_empty_data(self, rules_engine):
        results = rules_engine.validate_all({})

        assert 'results' in results
        assert results['summary']['total_failed'] > 0

    def test_missing_structural_data(self, rules_engine, minimal_building_data):
        results = rules_engine.validate_by_category('structural', minimal_building_data)

        assert results['summary']['total_failed'] > 0

    def test_zero_values(self, rules_engine):
        data = {
            "building": {"num_floors": 0, "height_m": 0, "footprint_m2": 0},
            "plot": {"area_m2": 0},
            "structural": {"dead_load_kn_m2": 0, "live_load_kn_m2": 0}
        }
        results = rules_engine.validate_all(data)

        assert results['summary']['total_failed'] > 10

    def test_negative_values(self, rules_engine):
        data = {
            "building": {"height_m": -5.0},
            "plot": {"area_m2": -100.0}
        }
        results = rules_engine.validate_all(data)

        assert results['summary']['total_failed'] > 0

    def test_validation_result_to_dict(self):
        result = ValidationResult(
            rule_id="TEST-001",
            passed=False,
            violations=["Test violation"],
            warnings=["Test warning"],
            evidence={"test_key": "test_value"},
            severity=RuleSeverity.HIGH
        )
        result_dict = result.to_dict()

        assert result_dict['rule_id'] == "TEST-001"
        assert result_dict['passed'] is False
        assert result_dict['severity'] == 'high'
        assert len(result_dict['violations']) == 1

    def test_building_rule_to_dict(self):
        rule = StrLoad001()
        rule_dict = rule.to_dict()

        assert rule_dict['rule_id'] == 'STR-LOAD-001'
        assert rule_dict['category'] == 'structural'
        assert rule_dict['severity'] == 'critical'


class TestRuleCategories:
    """Test rule category enumeration"""

    def test_all_categories_exist(self):
        categories = list(RuleCategory)
        assert len(categories) == 5
        assert RuleCategory.STRUCTURAL in categories
        assert RuleCategory.ZONING in categories
        assert RuleCategory.SAFETY in categories
        assert RuleCategory.ACCESSIBILITY in categories
        assert RuleCategory.ENVIRONMENTAL in categories

    def test_all_severities_exist(self):
        severities = list(RuleSeverity)
        assert len(severities) == 4
        assert RuleSeverity.CRITICAL in severities
        assert RuleSeverity.HIGH in severities
        assert RuleSeverity.MEDIUM in severities
        assert RuleSeverity.LOW in severities
