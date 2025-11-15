"""
Analysis Service Tests
Tests for ML models, PDF processing, and analysis pipeline.
"""

import pytest
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any

from app.analysis_service import (
    AnalysisService, DocumentType, ClassificationResult, DimensionData,
    AnalysisResult, load_models, classify_document, extract_dimensions,
    detect_violations, parse_dimensions_from_text, extract_metadata,
    validate_pdf, generate_report, extract_text_from_pdf
)


class TestLoadModels:
    """Test ML model loading functionality"""

    def test_load_models_no_directory(self):
        models = load_models()

        assert 'classifier' in models
        assert 'vectorizer' in models
        assert 'available' in models
        assert isinstance(models['available'], bool)

    def test_load_models_nonexistent_directory(self):
        models = load_models('/nonexistent/path')

        assert models is not None
        assert 'available' in models

    @patch('app.analysis_service.SKLEARN_AVAILABLE', False)
    def test_load_models_sklearn_unavailable(self):
        models = load_models()

        assert models['available'] is False
        assert models['classifier'] is None
        assert models['vectorizer'] is None

    def test_load_models_creates_classifier(self):
        models = load_models()

        if models['available']:
            assert models['classifier'] is not None
            assert models['vectorizer'] is not None


class TestDocumentClassification:
    """Test document type classification"""

    def test_document_type_enum(self):
        assert DocumentType.TABA.value == 'תב"ע'
        assert DocumentType.SURVEY_PLAN.value == 'תכנית מדידה'
        assert DocumentType.ACCORDION.value == 'גרמושקה'
        assert DocumentType.SECTION.value == 'חתך'
        assert DocumentType.ELEVATION.value == 'חזית'
        assert DocumentType.UNKNOWN.value == 'לא ידוע'

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_classify_document_rules_based(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = 'תב"ע תכנית זונינג אזור בנייה'

        result = classify_document('/fake/path.pdf')

        assert isinstance(result, ClassificationResult)
        assert result.document_type == DocumentType.TABA
        assert result.confidence > 0
        assert result.method == 'rules'

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_classify_document_survey_plan(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = 'תכנית מדידה מדידת קרקע גבולות מגרש'

        result = classify_document('/fake/path.pdf')

        assert result.document_type == DocumentType.SURVEY_PLAN

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_classify_document_accordion(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = 'גרמושקה תכנית קומה תכנית דירה floor plan'

        result = classify_document('/fake/path.pdf')

        assert result.document_type == DocumentType.ACCORDION

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_classify_document_section(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = 'חתך אנכי גובה קומות section vertical'

        result = classify_document('/fake/path.pdf')

        assert result.document_type == DocumentType.SECTION

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_classify_document_elevation(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = 'חזית בניין מראה חיצוני elevation facade'

        result = classify_document('/fake/path.pdf')

        assert result.document_type == DocumentType.ELEVATION

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_classify_document_unknown(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = 'random text without keywords'

        result = classify_document('/fake/path.pdf')

        assert result.document_type == DocumentType.UNKNOWN
        assert result.confidence == 0.0

    @patch('app.analysis_service.validate_pdf')
    def test_classify_document_invalid_pdf(self, mock_validate):
        mock_validate.return_value = False

        result = classify_document('/fake/path.pdf')

        assert result.document_type == DocumentType.UNKNOWN
        assert result.method == 'validation_failed'


class TestDimensionExtraction:
    """Test dimension extraction from text"""

    def test_parse_dimensions_setbacks(self):
        text = """
        נסיגה צפונית: 3.5 מ'
        נסיגה דרומית: 3.0 מ'
        נסיגה מזרחית: 2.5 מ'
        נסיגה מערבית: 2.0 מ'
        """
        data = parse_dimensions_from_text(text)

        assert 'north' in data.setbacks
        assert data.setbacks['north'] == 3.5
        assert data.setbacks['south'] == 3.0
        assert data.setbacks['east'] == 2.5
        assert data.setbacks['west'] == 2.0

    def test_parse_dimensions_heights(self):
        text = """
        גובה בניין: 12.5 מ'
        גובה קומה: 3.0 מ'
        גובה תקרה: 2.7 מ'
        """
        data = parse_dimensions_from_text(text)

        assert 'building' in data.heights
        assert data.heights['building'] == 12.5
        assert data.heights['floor'] == 3.0
        assert data.heights['ceiling'] == 2.7

    def test_parse_dimensions_areas(self):
        text = """
        שטח מגרש: 1000 מ"ר
        שטח בניין: 500 מ"ר
        שטח קומה: 125 מ"ר
        """
        data = parse_dimensions_from_text(text)

        assert 'plot' in data.areas
        assert data.areas['plot'] == 1000
        assert data.areas['building'] == 500
        assert data.areas['floor'] == 125

    def test_parse_dimensions_mixed(self):
        text = """
        נסיגה צפונית: 4 מ'
        גובה בניין: 15 מ'
        שטח מגרש: 800 מ"ר
        רוחב: 25 מ'
        """
        data = parse_dimensions_from_text(text)

        assert len(data.setbacks) >= 1
        assert len(data.heights) >= 1
        assert len(data.areas) >= 1
        assert len(data.lengths) >= 1

    def test_parse_dimensions_empty_text(self):
        data = parse_dimensions_from_text('')

        assert len(data.setbacks) == 0
        assert len(data.heights) == 0
        assert len(data.areas) == 0
        assert len(data.lengths) == 0

    def test_parse_dimensions_decimal_values(self):
        text = "נסיגה צפונית: 3.75 מ'"
        data = parse_dimensions_from_text(text)

        assert data.setbacks['north'] == 3.75

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_extract_dimensions_integration(self, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = """
        נסיגה צפונית: 3.5 מ'
        גובה בניין: 12 מ'
        שטח מגרש: 1000 מ"ר
        """

        result = extract_dimensions('/fake/path.pdf')

        assert isinstance(result, DimensionData)
        assert result.extraction_method == 'text'
        assert result.confidence > 0


class TestViolationDetection:
    """Test violation detection and rules integration"""

    @patch('app.analysis_service.RULES_ENGINE_AVAILABLE', True)
    @patch('app.analysis_service.RulesEngine')
    def test_detect_violations_with_data(self, MockRulesEngine, sample_building_data):
        mock_engine = MockRulesEngine.return_value
        mock_engine.validate_all.return_value = {
            'results': [
                {
                    'rule_id': 'TEST-001',
                    'passed': False,
                    'violations': ['Test violation'],
                    'warnings': ['Test warning'],
                    'severity': 'high'
                }
            ],
            'summary': {
                'total_rules': 1,
                'total_passed': 0,
                'total_failed': 1
            }
        }

        result = detect_violations(sample_building_data)

        assert 'violations' in result
        assert 'warnings' in result
        assert len(result['violations']) > 0
        assert result['passed'] is False

    @patch('app.analysis_service.RULES_ENGINE_AVAILABLE', False)
    def test_detect_violations_engine_unavailable(self, sample_building_data):
        result = detect_violations(sample_building_data)

        assert 'error' in result
        assert result['passed'] is False

    @patch('app.analysis_service.RULES_ENGINE_AVAILABLE', True)
    @patch('app.analysis_service.RulesEngine')
    def test_detect_violations_severity_scoring(self, MockRulesEngine, sample_building_data):
        mock_engine = MockRulesEngine.return_value
        mock_engine.validate_all.return_value = {
            'results': [
                {
                    'rule_id': 'TEST-001',
                    'passed': False,
                    'violations': ['Critical violation'],
                    'warnings': [],
                    'severity': 'critical'
                },
                {
                    'rule_id': 'TEST-002',
                    'passed': False,
                    'violations': ['High violation'],
                    'warnings': [],
                    'severity': 'high'
                }
            ],
            'summary': {}
        }

        result = detect_violations(sample_building_data, mock_engine)

        assert result['total_severity'] == 175


class TestPDFUtilities:
    """Test PDF validation and text extraction"""

    def test_validate_pdf_nonexistent(self):
        result = validate_pdf('/nonexistent/file.pdf')
        assert result is False

    def test_validate_pdf_wrong_extension(self):
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
            temp_path = f.name
        try:
            result = validate_pdf(temp_path)
            assert result is False
        finally:
            Path(temp_path).unlink()

    @patch('app.analysis_service.PDFPLUMBER_AVAILABLE', False)
    @patch('app.analysis_service.PYMUPDF_AVAILABLE', False)
    def test_extract_text_no_libraries(self):
        result = extract_text_from_pdf('/fake/path.pdf')
        assert result == ''

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    def test_extract_metadata_success(self, mock_extract, mock_validate):
        mock_validate.return_value = True

        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            temp_path = f.name

        try:
            result = extract_metadata(temp_path)

            assert 'filename' in result
            assert 'file_size_bytes' in result
            assert 'page_count' in result
        finally:
            Path(temp_path).unlink()


class TestAnalysisService:
    """Test AnalysisService class"""

    def test_analysis_service_init(self):
        service = AnalysisService()

        assert service.models is not None
        assert 'available' in service.models

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    @patch('app.analysis_service.classify_document')
    @patch('app.analysis_service.extract_dimensions')
    @patch('app.analysis_service.extract_metadata')
    def test_process_pdf(self, mock_meta, mock_dims, mock_classify, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_classify.return_value = ClassificationResult(
            document_type=DocumentType.TABA,
            confidence=0.9,
            method='rules'
        )
        mock_dims.return_value = DimensionData(
            setbacks={'north': 3.0},
            extraction_method='text',
            confidence=0.8
        )
        mock_meta.return_value = {'filename': 'test.pdf', 'page_count': 5}

        service = AnalysisService()
        result = service.process_pdf('/fake/path.pdf')

        assert result['status'] == 'success'
        assert 'classification' in result
        assert 'dimensions' in result
        assert 'metadata' in result

    @patch('app.analysis_service.AnalysisService.process_pdf')
    def test_analyze_submission(self, mock_process):
        mock_process.return_value = {
            'file': 'test.pdf',
            'status': 'success',
            'classification': {'type': 'תב"ע', 'confidence': 0.9},
            'dimensions': {'setbacks': {'north': 3.0}}
        }

        service = AnalysisService()
        result = service.analyze_submission(['/fake/test.pdf'], 'SUB-001')

        assert isinstance(result, AnalysisResult)
        assert result.submission_id == 'SUB-001'
        assert result.status == 'success'

    def test_aggregate_results_empty(self):
        service = AnalysisService()
        result = service.aggregate_results([])

        assert 'classifications' in result
        assert 'dimensions' in result
        assert len(result['classifications']) == 0

    def test_aggregate_results_with_data(self):
        service = AnalysisService()
        results = [
            {
                'status': 'success',
                'classification': {'type': 'תב"ע', 'confidence': 0.9},
                'dimensions': {
                    'setbacks': {'north': 3.0},
                    'heights': {'building': 12.0},
                    'areas': {'plot': 1000.0},
                    'lengths': {'width': 25.0}
                }
            },
            {
                'status': 'success',
                'classification': {'type': 'גרמושקה', 'confidence': 0.85},
                'dimensions': {
                    'setbacks': {'south': 3.5},
                    'heights': {'floor': 3.0},
                    'areas': {'building': 500.0},
                    'lengths': {}
                }
            }
        ]

        aggregated = service.aggregate_results(results)

        assert len(aggregated['classifications']) == 2
        assert 'north' in aggregated['dimensions']['setbacks']
        assert 'south' in aggregated['dimensions']['setbacks']
        assert 'building' in aggregated['dimensions']['heights']

    def test_calculate_confidence_empty(self):
        service = AnalysisService()
        confidence = service.calculate_confidence({})

        assert confidence == 0.0

    def test_calculate_confidence_with_data(self):
        service = AnalysisService()
        aggregated = {
            'classifications': [
                {'confidence': 0.9},
                {'confidence': 0.8}
            ],
            'dimensions': {
                'setbacks': {'north': 3.0},
                'heights': {'building': 12.0},
                'areas': {},
                'lengths': {}
            },
            'validation': {'passed': True}
        }

        confidence = service.calculate_confidence(aggregated)

        assert 0.0 <= confidence <= 1.0
        assert confidence > 0.5

    def test_build_validation_data(self):
        service = AnalysisService()
        dimensions = {
            'setbacks': {'north': 3.0, 'south': 3.5},
            'heights': {'building': 12.0},
            'areas': {'plot': 1000.0, 'total': 2000.0, 'built': 500.0},
            'lengths': {}
        }

        data = service._build_validation_data(dimensions)

        assert 'building' in data
        assert 'plot' in data
        assert 'structural' in data
        assert data['building']['height_m'] == 12.0
        assert data['plot']['area_m2'] == 1000.0
        assert data['building']['num_floors'] == 4


class TestReportGeneration:
    """Test report generation"""

    def test_generate_report_no_violations(self):
        analysis_result = {
            'validation_results': {
                'summary': {
                    'total_rules': 20,
                    'total_passed': 20,
                    'total_failed': 0,
                    'pass_rate_percent': 100.0,
                    'total_violations': 0,
                    'total_warnings': 0
                }
            },
            'violations': [],
            'warnings': [],
            'total_severity': 0
        }

        report = generate_report(analysis_result)

        assert 'BUILDING PERMIT ANALYSIS REPORT' in report
        assert 'Total Rules Checked: 20' in report
        assert 'Rules Passed: 20' in report
        assert 'Pass Rate: 100.0%' in report

    def test_generate_report_with_violations(self):
        analysis_result = {
            'validation_results': {
                'summary': {
                    'total_rules': 20,
                    'total_passed': 15,
                    'total_failed': 5,
                    'pass_rate_percent': 75.0,
                    'total_violations': 8,
                    'total_warnings': 3
                }
            },
            'violations': [
                {'rule_id': 'STR-001', 'severity': 'critical', 'message': 'Critical violation'},
                {'rule_id': 'SAF-002', 'severity': 'high', 'message': 'High violation'},
                {'rule_id': 'ACC-003', 'severity': 'medium', 'message': 'Medium violation'}
            ],
            'warnings': [
                {'rule_id': 'ENV-001', 'message': 'Warning message'}
            ],
            'total_severity': 225
        }

        report = generate_report(analysis_result)

        assert 'VIOLATIONS' in report
        assert 'CRITICAL' in report
        assert 'HIGH' in report
        assert 'MEDIUM' in report
        assert 'WARNINGS' in report
        assert 'Total Severity Score: 225' in report


class TestClassificationResult:
    """Test ClassificationResult dataclass"""

    def test_classification_result_creation(self):
        result = ClassificationResult(
            document_type=DocumentType.TABA,
            confidence=0.95,
            features={'test': 'value'},
            method='ml'
        )

        assert result.document_type == DocumentType.TABA
        assert result.confidence == 0.95
        assert result.method == 'ml'
        assert 'test' in result.features


class TestDimensionData:
    """Test DimensionData dataclass"""

    def test_dimension_data_creation(self):
        data = DimensionData(
            setbacks={'north': 3.0},
            heights={'building': 12.0},
            areas={'plot': 1000.0},
            lengths={'width': 25.0},
            raw_text='sample text',
            extraction_method='text',
            confidence=0.85
        )

        assert len(data.setbacks) == 1
        assert data.heights['building'] == 12.0
        assert data.extraction_method == 'text'
        assert data.confidence == 0.85

    def test_dimension_data_defaults(self):
        data = DimensionData()

        assert len(data.setbacks) == 0
        assert len(data.heights) == 0
        assert data.raw_text == ''
        assert data.confidence == 0.0


class TestAnalysisResult:
    """Test AnalysisResult dataclass"""

    def test_analysis_result_creation(self):
        result = AnalysisResult(
            submission_id='SUB-001',
            status='success',
            overall_confidence=0.9,
            processing_time_seconds=5.2,
            timestamp='2025-01-01T00:00:00Z'
        )

        assert result.submission_id == 'SUB-001'
        assert result.status == 'success'
        assert result.overall_confidence == 0.9
        assert len(result.violations) == 0

    def test_analysis_result_with_violations(self):
        result = AnalysisResult(
            submission_id='SUB-002',
            status='partial',
            violations=[
                {'rule_id': 'TEST-001', 'severity': 'high', 'message': 'Test violation'}
            ],
            warnings=['Test warning']
        )

        assert len(result.violations) == 1
        assert len(result.warnings) == 1
        assert result.status == 'partial'


class TestIntegration:
    """Integration tests for complete workflows"""

    @patch('app.analysis_service.validate_pdf')
    @patch('app.analysis_service.extract_text_from_pdf')
    @patch('app.analysis_service.RULES_ENGINE_AVAILABLE', True)
    @patch('app.analysis_service.RulesEngine')
    def test_full_analysis_pipeline(self, MockRulesEngine, mock_extract, mock_validate):
        mock_validate.return_value = True
        mock_extract.return_value = """
        תב"ע תכנית זונינג
        נסיגה צפונית: 3.5 מ'
        גובה בניין: 12 מ'
        שטח מגרש: 1000 מ"ר
        """

        mock_engine = MockRulesEngine.return_value
        mock_engine.validate_all.return_value = {
            'results': [],
            'summary': {
                'total_rules': 20,
                'total_passed': 20,
                'total_failed': 0,
                'total_violations': 0,
                'total_warnings': 0
            }
        }

        service = AnalysisService()
        result = service.analyze_submission(['/fake/test.pdf'], 'INT-001')

        assert result.submission_id == 'INT-001'
        assert result.status in ['success', 'partial']
        assert result.overall_confidence > 0

    @patch('app.analysis_service.validate_pdf')
    def test_failed_pdf_processing(self, mock_validate):
        mock_validate.return_value = False

        service = AnalysisService()
        result = service.process_pdf('/invalid/file.pdf')

        assert result['status'] == 'success'
