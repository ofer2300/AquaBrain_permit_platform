# AI Service Tests

Comprehensive pytest test suites for the Building Permit Platform AI service.

## Test Coverage

### test_rules_engine.py (100+ tests)
Tests for all 20 building code validation rules:

**Structural Rules (STR-*):**
- STR-LOAD-001: Design loads verification
- STR-FOUND-002: Foundation depth minimum
- STR-COLUMN-003: Column dimensions
- STR-BEAM-004: Beam dimensions
- STR-SLAB-005: Slab thickness

**Zoning Rules (ZON-*):**
- ZON-SETBACK-001: Building setbacks
- ZON-HEIGHT-002: Maximum building height
- ZON-COVERAGE-003: Building coverage percentage
- ZON-FAR-004: Floor Area Ratio
- ZON-PARKING-005: Required parking spaces

**Safety Rules (SAF-*):**
- SAF-FIRE-001: Fire suppression requirements
- SAF-EVAC-002: Emergency exits
- SAF-STAIR-003: Stairway dimensions
- SAF-RAIL-004: Safety railings
- SAF-LIGHT-005: Emergency lighting

**Accessibility Rules (ACC-*):**
- ACC-RAMP-001: Ramp slope
- ACC-DOOR-002: Accessible door width
- ACC-ELEV-003: Elevator requirements

**Environmental Rules (ENV-*):**
- ENV-ENERGY-001: Green building standard (SI 5282)
- ENV-NOISE-002: Acoustic insulation (SI 1004)

**RulesEngine Tests:**
- Initialization and configuration
- validate_all() method
- validate_by_category() method
- Helper functions (parking calculation, ramp slope verification)
- Edge cases and error handling

### test_analysis_service.py (80+ tests)
Tests for ML models, PDF processing, and analysis pipeline:

**Model Loading:**
- load_models() with/without directory
- Handling missing scikit-learn
- Model creation and training

**Document Classification:**
- All 5 Israeli document types (תב"ע, תכנית מדידה, גרמושקה, חתך, חזית)
- Rules-based classification
- ML-based classification
- Unknown document handling

**Dimension Extraction:**
- parse_dimensions_from_text() with Hebrew text
- Setback extraction (נסיגה)
- Height extraction (גובה)
- Area extraction (שטח)
- Length extraction (אורך, רוחב, עומק)
- Mixed dimension parsing

**Violation Detection:**
- Integration with RulesEngine
- Severity scoring
- Report generation

**PDF Utilities:**
- validate_pdf()
- extract_text_from_pdf()
- extract_text_with_ocr()
- extract_metadata()

**AnalysisService Class:**
- Initialization
- process_pdf() method
- analyze_submission() method
- aggregate_results() method
- calculate_confidence() method
- _build_validation_data() method

**Integration Tests:**
- Full analysis pipeline
- Multi-file processing
- Error handling

## Running Tests

### Prerequisites

```bash
# Install pytest and dependencies
pip install pytest pytest-cov pytest-mock

# Install AI service dependencies
pip install -r ../requirements.txt
```

### Run All Tests

```bash
# From ai-service directory
pytest tests/ -v

# With coverage report
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_rules_engine.py -v

# Run specific test class
pytest tests/test_rules_engine.py::TestStructuralRules -v

# Run specific test
pytest tests/test_rules_engine.py::TestStructuralRules::test_str_load_001_pass -v
```

### Run by Category

```bash
# Unit tests only
pytest tests/ -m unit

# Integration tests only
pytest tests/ -m integration

# Skip slow tests
pytest tests/ -m "not slow"
```

### Generate Coverage Report

```bash
# HTML coverage report (opens in browser)
pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html

# Terminal coverage report
pytest tests/ --cov=app --cov-report=term-missing

# XML coverage report (for CI/CD)
pytest tests/ --cov=app --cov-report=xml
```

## Test Structure

```
tests/
├── __init__.py              # Package initialization
├── conftest.py              # Shared fixtures and configuration
├── test_rules_engine.py     # Rules engine tests (100+ tests)
├── test_analysis_service.py # Analysis service tests (80+ tests)
└── README.md                # This file
```

## Fixtures (conftest.py)

**rules_engine** - RulesEngine instance
**analysis_service** - AnalysisService instance
**sample_building_data** - Valid building data that passes all rules
**failing_building_data** - Invalid building data that violates multiple rules
**minimal_building_data** - Minimal data for edge case testing

## Expected Coverage

- **Lines:** >85%
- **Branches:** >75%
- **Functions:** >90%

## Test Results Summary

**Total Tests:** 180+
- test_rules_engine.py: 100+ tests
- test_analysis_service.py: 80+ tests

**Test Categories:**
- Structural: 25 tests
- Zoning: 20 tests
- Safety: 25 tests
- Accessibility: 15 tests
- Environmental: 10 tests
- ML/Classification: 20 tests
- PDF Processing: 15 tests
- Integration: 10 tests
- Edge Cases: 15 tests
- Utilities: 25 tests

## Continuous Integration

Add to CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run AI Service Tests
  run: |
    cd ai-service
    pip install -r requirements.txt
    pip install pytest pytest-cov
    pytest tests/ --cov=app --cov-report=xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./ai-service/coverage.xml
```

## Troubleshooting

**ImportError: No module named 'app'**
- Ensure you're running from ai-service directory
- Check sys.path in conftest.py

**Missing dependencies**
- Install: `pip install -r requirements.txt`
- Install test tools: `pip install pytest pytest-cov pytest-mock`

**Tests fail due to missing ML libraries**
- Some tests are skipped if sklearn not available
- Install: `pip install scikit-learn numpy pandas`

**PDF tests fail**
- Install PDF libraries: `pip install pdfplumber PyMuPDF pytesseract`
- For OCR: Install tesseract-ocr system package

## Notes

- All tests use mocking for external dependencies (PDF files, ML models)
- No actual PDF files needed to run tests
- Tests are self-contained and can run in any order
- Expected runtime: <60 seconds for all tests
