"""
AI Analysis Service for Building Permit Platform
Orchestrates PDF processing, ML models, and rules validation.

This module provides:
- PDF document classification (5 Israeli document types)
- Dimension extraction using pdfplumber and OCR
- ML-based classification (RandomForest)
- Rules engine integration for violation detection
- Complete analysis pipeline with confidence scoring
"""

import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json
from datetime import datetime

# PDF processing libraries
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    logging.warning("pdfplumber not available, PDF text extraction will be limited")

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logging.warning("PyMuPDF not available, using fallback PDF processing")

try:
    import pytesseract
    from PIL import Image
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False
    logging.warning("pytesseract not available, OCR functionality disabled")

# ML libraries
try:
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    import pickle
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not available, using rules-based classification")

# Import rules engine
try:
    from .rules_engine import RulesEngine, ValidationResult
    RULES_ENGINE_AVAILABLE = True
except ImportError:
    try:
        from rules_engine import RulesEngine, ValidationResult
        RULES_ENGINE_AVAILABLE = True
    except ImportError:
        RULES_ENGINE_AVAILABLE = False
        logging.error("RulesEngine not available, validation will be disabled")

logger = logging.getLogger(__name__)


class DocumentType(Enum):
    """Israeli building permit document types"""
    TABA = "תב\"ע"  # Zoning Plan
    SURVEY_PLAN = "תכנית מדידה"  # Survey Plan
    ACCORDION = "גרמושקה"  # Accordion/Floor Plan
    SECTION = "חתך"  # Section
    ELEVATION = "חזית"  # Elevation
    UNKNOWN = "לא ידוע"  # Unknown


@dataclass
class ClassificationResult:
    """Result of document classification"""
    document_type: DocumentType
    confidence: float
    features: Dict[str, Any] = field(default_factory=dict)
    method: str = "rules"  # "ml" or "rules"


@dataclass
class DimensionData:
    """Extracted dimension data from document"""
    setbacks: Dict[str, float] = field(default_factory=dict)
    heights: Dict[str, float] = field(default_factory=dict)
    areas: Dict[str, float] = field(default_factory=dict)
    lengths: Dict[str, float] = field(default_factory=dict)
    raw_text: str = ""
    extraction_method: str = "text"  # "text" or "ocr"
    confidence: float = 0.0


@dataclass
class AnalysisResult:
    """Complete analysis result for a submission"""
    submission_id: str
    status: str  # "success", "partial", "failed"
    document_classifications: List[ClassificationResult] = field(default_factory=list)
    extracted_dimensions: Dict[str, Any] = field(default_factory=dict)
    validation_results: Dict[str, Any] = field(default_factory=dict)
    violations: List[Dict[str, Any]] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    overall_confidence: float = 0.0
    processing_time_seconds: float = 0.0
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


# ============================================================================
# MODEL LOADING
# ============================================================================

def load_models(model_dir: Optional[str] = None) -> Dict[str, Any]:
    """
    Load ML models for document classification and analysis.
    Returns dictionary of model objects or mock clients.

    Args:
        model_dir: Directory containing saved models

    Returns:
        Dictionary with loaded models:
        - 'classifier': RandomForestClassifier or None
        - 'vectorizer': TfidfVectorizer or None
        - 'available': bool indicating if models are loaded
    """
    models = {
        'classifier': None,
        'vectorizer': None,
        'available': False
    }

    if not SKLEARN_AVAILABLE:
        logger.warning("scikit-learn not available, models will not be loaded")
        return models

    # Try to load pre-trained models
    if model_dir:
        model_path = Path(model_dir)
        classifier_file = model_path / "document_classifier.pkl"
        vectorizer_file = model_path / "tfidf_vectorizer.pkl"

        try:
            if classifier_file.exists() and vectorizer_file.exists():
                with open(classifier_file, 'rb') as f:
                    models['classifier'] = pickle.load(f)
                with open(vectorizer_file, 'rb') as f:
                    models['vectorizer'] = pickle.load(f)
                models['available'] = True
                logger.info(f"Loaded pre-trained models from {model_dir}")
                return models
        except Exception as e:
            logger.warning(f"Failed to load models from {model_dir}: {e}")

    # Create and train a basic model if none exists
    try:
        logger.info("Creating new RandomForest classifier with default training")

        # Create vectorizer
        vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))

        # Create training data with Hebrew keywords
        training_texts = [
            "תב\"ע תכנית זונינג אזור בנייה",  # TABA
            "תכנית מדידה מדידת קרקע גבולות",  # Survey
            "גרמושקה קומה תכנית דירה",  # Accordion
            "חתך אנכי גובה קומות",  # Section
            "חזית חיצוני חזית בניין"  # Elevation
        ]
        training_labels = [0, 1, 2, 3, 4]  # Indices for DocumentType enum

        # Train vectorizer and classifier
        X_train = vectorizer.fit_transform(training_texts)
        classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        classifier.fit(X_train, training_labels)

        models['classifier'] = classifier
        models['vectorizer'] = vectorizer
        models['available'] = True

        logger.info("Created and trained new document classifier")
    except Exception as e:
        logger.error(f"Failed to create models: {e}")

    return models


# ============================================================================
# DOCUMENT CLASSIFICATION
# ============================================================================

def classify_document(pdf_path: str, models: Optional[Dict[str, Any]] = None) -> ClassificationResult:
    """
    Classify document type using ML or rules-based approach.

    Identifies Israeli building permit document types:
    - תב"ע (TABA): Zoning Plan
    - תכנית מדידה: Survey Plan
    - גרמושקה: Accordion/Floor Plan
    - חתך: Section
    - חזית: Elevation

    Args:
        pdf_path: Path to PDF file
        models: Dictionary with ML models (from load_models)

    Returns:
        ClassificationResult with document_type and confidence
    """
    logger.info(f"Classifying document: {pdf_path}")

    # Validate PDF exists
    if not validate_pdf(pdf_path):
        return ClassificationResult(
            document_type=DocumentType.UNKNOWN,
            confidence=0.0,
            method="validation_failed"
        )

    # Extract text from PDF
    try:
        text = extract_text_from_pdf(pdf_path)
        if not text or len(text.strip()) < 10:
            logger.warning(f"Insufficient text extracted from {pdf_path}, trying OCR")
            text = extract_text_with_ocr(pdf_path)
    except Exception as e:
        logger.error(f"Failed to extract text from {pdf_path}: {e}")
        text = ""

    # Try ML classification if models available
    if models and models.get('available') and text:
        try:
            result = _classify_with_ml(text, models)
            if result.confidence > 0.5:
                return result
            else:
                logger.info("ML confidence low, falling back to rules-based classification")
        except Exception as e:
            logger.warning(f"ML classification failed: {e}, falling back to rules")

    # Fallback to rules-based classification
    return _classify_with_rules(text, pdf_path)


def _classify_with_ml(text: str, models: Dict[str, Any]) -> ClassificationResult:
    """Classify using ML models"""
    classifier = models['classifier']
    vectorizer = models['vectorizer']

    # Vectorize text
    X = vectorizer.transform([text])

    # Predict
    prediction = classifier.predict(X)[0]
    probabilities = classifier.predict_proba(X)[0]
    confidence = float(probabilities[prediction])

    # Map to DocumentType
    doc_types = list(DocumentType)
    document_type = doc_types[prediction] if prediction < len(doc_types) else DocumentType.UNKNOWN

    return ClassificationResult(
        document_type=document_type,
        confidence=confidence,
        features={'ml_probabilities': probabilities.tolist()},
        method="ml"
    )


def _classify_with_rules(text: str, pdf_path: str) -> ClassificationResult:
    """Classify using rules-based approach with Hebrew keywords"""
    text_lower = text.lower()

    # Define Hebrew keyword patterns for each document type
    patterns = {
        DocumentType.TABA: [
            r'תב["\']ע',
            r'תכנית\s+זונינג',
            r'אזור\s+בנייה',
            r'ייעוד\s+קרקע',
            r'תכנית\s+מתאר'
        ],
        DocumentType.SURVEY_PLAN: [
            r'תכנית\s+מדידה',
            r'מדידת\s+קרקע',
            r'גבולות\s+מגרש',
            r'שטח\s+מגרש',
            r'נקודות\s+ציון'
        ],
        DocumentType.ACCORDION: [
            r'גרמושקה',
            r'תכנית\s+קומה',
            r'תכנית\s+דירה',
            r'פריסת\s+חדרים',
            r'floor\s+plan'
        ],
        DocumentType.SECTION: [
            r'חתך',
            r'חתך\s+אנכי',
            r'גובה\s+קומות',
            r'section',
            r'vertical\s+section'
        ],
        DocumentType.ELEVATION: [
            r'חזית',
            r'חזית\s+בניין',
            r'מראה\s+חיצוני',
            r'elevation',
            r'facade'
        ]
    }

    # Score each document type
    scores = {}
    features = {}

    for doc_type, keywords in patterns.items():
        score = 0
        matches = []
        for pattern in keywords:
            matches_found = re.findall(pattern, text, re.IGNORECASE | re.UNICODE)
            if matches_found:
                score += len(matches_found)
                matches.extend(matches_found)

        scores[doc_type] = score
        features[doc_type.value] = {
            'score': score,
            'matches': matches[:5]  # Store first 5 matches
        }

    # Also check metadata from filename
    filename = Path(pdf_path).stem.lower()
    for doc_type in patterns.keys():
        if any(keyword in filename for keyword in ['taba', 'survey', 'accordion', 'section', 'elevation']):
            scores[doc_type] = scores.get(doc_type, 0) + 2

    # Find best match
    if not scores or max(scores.values()) == 0:
        return ClassificationResult(
            document_type=DocumentType.UNKNOWN,
            confidence=0.0,
            features=features,
            method="rules"
        )

    best_type = max(scores, key=scores.get)
    max_score = scores[best_type]
    total_score = sum(scores.values()) or 1
    confidence = min(max_score / total_score, 1.0)

    return ClassificationResult(
        document_type=best_type,
        confidence=confidence,
        features=features,
        method="rules"
    )


# ============================================================================
# DIMENSION EXTRACTION
# ============================================================================

def extract_dimensions(pdf_path: str) -> DimensionData:
    """
    Extract dimensions from PDF using text parsing and OCR.

    Extracts:
    - Setbacks (נסיגה): north, south, east, west
    - Heights (גובה): building, floor, ceiling
    - Areas (שטח): plot, building, floor
    - Lengths (אורך): walls, rooms

    Detects units: meters (מ'), centimeters (ס"מ), square meters (מ"ר)

    Args:
        pdf_path: Path to PDF file

    Returns:
        DimensionData with all extracted dimensions
    """
    logger.info(f"Extracting dimensions from: {pdf_path}")

    # Validate PDF
    if not validate_pdf(pdf_path):
        return DimensionData(confidence=0.0)

    # Extract text
    try:
        text = extract_text_from_pdf(pdf_path)
        method = "text"
        confidence = 0.8
    except Exception as e:
        logger.warning(f"Text extraction failed, trying OCR: {e}")
        text = extract_text_with_ocr(pdf_path)
        method = "ocr"
        confidence = 0.6

    if not text:
        logger.error(f"No text extracted from {pdf_path}")
        return DimensionData(confidence=0.0)

    # Parse dimensions from text
    dimensions = parse_dimensions_from_text(text)
    dimensions.raw_text = text[:500]  # Store first 500 chars
    dimensions.extraction_method = method
    dimensions.confidence = confidence

    return dimensions


def parse_dimensions_from_text(text: str) -> DimensionData:
    """
    Parse dimensions using regex patterns for Israeli units.

    Patterns:
    - Numbers with units: "5.5 מ'", "350 ס\"מ", "120 מ\"ר"
    - Measurements: "נסיגה צפונית: 3 מ'", "גובה בניין: 12 מ'"
    - Ranges: "3-5 מ'", "2.5 עד 4 מ'"

    Args:
        text: Extracted text from PDF

    Returns:
        DimensionData with parsed values
    """
    data = DimensionData()

    # Pattern for Hebrew number with units
    # Matches: "5.5 מ'", "350 ס"מ", "120.5 מ"ר"
    number_pattern = r'(\d+(?:\.\d+)?)\s*([מס]["\']?[מרטגצ]?)'

    # Setback patterns (נסיגה)
    setback_patterns = {
        'north': r'נסיגה?\s*צפונ[יה]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)',
        'south': r'נסיגה?\s*דרומ[יה]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)',
        'east': r'נסיגה?\s*מזרח[יה]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)',
        'west': r'נסיגה?\s*מערב[יה]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)',
        'front': r'נסיגה?\s*קדמ[יה]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)',
        'rear': r'נסיגה?\s*אחור[יה]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)',
        'side': r'נסיגה?\s*צד[יד]?[תם]?\s*:?\s*(\d+(?:\.\d+)?)'
    }

    for direction, pattern in setback_patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE | re.UNICODE)
        if matches:
            # Take first match, convert to float
            data.setbacks[direction] = float(matches[0])

    # Height patterns (גובה)
    height_patterns = {
        'building': r'גובה\s*בני[יי]ן\s*:?\s*(\d+(?:\.\d+)?)',
        'floor': r'גובה\s*קומה\s*:?\s*(\d+(?:\.\d+)?)',
        'ceiling': r'גובה\s*תקרה\s*:?\s*(\d+(?:\.\d+)?)',
        'total': r'גובה\s*כולל\s*:?\s*(\d+(?:\.\d+)?)'
    }

    for height_type, pattern in height_patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE | re.UNICODE)
        if matches:
            data.heights[height_type] = float(matches[0])

    # Area patterns (שטח)
    area_patterns = {
        'plot': r'שטח\s*מגרש\s*:?\s*(\d+(?:\.\d+)?)',
        'building': r'שטח\s*בני[יי]ן\s*:?\s*(\d+(?:\.\d+)?)',
        'floor': r'שטח\s*קומה\s*:?\s*(\d+(?:\.\d+)?)',
        'built': r'שטח\s*בנוי\s*:?\s*(\d+(?:\.\d+)?)',
        'total': r'שטח\s*כולל\s*:?\s*(\d+(?:\.\d+)?)'
    }

    for area_type, pattern in area_patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE | re.UNICODE)
        if matches:
            data.areas[area_type] = float(matches[0])

    # Length patterns (אורך)
    length_patterns = {
        'wall': r'אורך\s*קיר\s*:?\s*(\d+(?:\.\d+)?)',
        'width': r'רוחב\s*:?\s*(\d+(?:\.\d+)?)',
        'depth': r'עומק\s*:?\s*(\d+(?:\.\d+)?)'
    }

    for length_type, pattern in length_patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE | re.UNICODE)
        if matches:
            data.lengths[length_type] = float(matches[0])

    # Generic number extraction with units
    all_measurements = re.findall(number_pattern, text, re.UNICODE)
    if all_measurements:
        # Store raw measurements for debugging
        data.lengths['raw_measurements'] = len(all_measurements)

    return data


# ============================================================================
# VIOLATION DETECTION
# ============================================================================

def detect_violations(data: Dict[str, Any], rules: Optional[RulesEngine] = None) -> Dict[str, Any]:
    """
    Detect violations using rules engine.

    Args:
        data: Dictionary with building and plot data
        rules: RulesEngine instance (creates new one if None)

    Returns:
        Comprehensive analysis with violations, severity, report
    """
    logger.info("Detecting violations using rules engine")

    if not RULES_ENGINE_AVAILABLE:
        logger.error("RulesEngine not available")
        return {
            'error': 'RulesEngine not available',
            'violations': [],
            'warnings': [],
            'passed': False
        }

    # Create rules engine if not provided
    if rules is None:
        try:
            rules = RulesEngine()
        except Exception as e:
            logger.error(f"Failed to create RulesEngine: {e}")
            return {
                'error': f'Failed to create RulesEngine: {str(e)}',
                'violations': [],
                'warnings': [],
                'passed': False
            }

    # Validate all rules
    try:
        validation_results = rules.validate_all(data)
    except Exception as e:
        logger.error(f"Validation failed: {e}", exc_info=True)
        return {
            'error': f'Validation failed: {str(e)}',
            'violations': [],
            'warnings': [],
            'passed': False
        }

    # Aggregate violations
    all_violations = []
    all_warnings = []

    for result in validation_results.get('results', []):
        if not result.get('passed', True):
            all_violations.extend([
                {
                    'rule_id': result['rule_id'],
                    'severity': result['severity'],
                    'message': violation
                }
                for violation in result.get('violations', [])
            ])

        all_warnings.extend([
            {
                'rule_id': result['rule_id'],
                'message': warning
            }
            for warning in result.get('warnings', [])
        ])

    # Calculate severity scores
    severity_scores = {
        'critical': 100,
        'high': 75,
        'medium': 50,
        'low': 25
    }

    total_severity = sum(
        severity_scores.get(v['severity'], 0)
        for v in all_violations
    )

    # Generate detailed report
    report = generate_report({
        'validation_results': validation_results,
        'violations': all_violations,
        'warnings': all_warnings,
        'total_severity': total_severity
    })

    return {
        'validation_results': validation_results,
        'violations': all_violations,
        'warnings': all_warnings,
        'total_severity': total_severity,
        'has_critical_violations': any(
            v['severity'] == 'critical' for v in all_violations
        ),
        'passed': len(all_violations) == 0,
        'report': report
    }


# ============================================================================
# ANALYSIS SERVICE CLASS
# ============================================================================

class AnalysisService:
    """Main AI analysis service for building permit processing"""

    def __init__(self, model_dir: Optional[str] = None):
        """
        Initialize analysis service.

        Args:
            model_dir: Directory containing ML models
        """
        logger.info("Initializing AnalysisService")

        # Load ML models
        self.models = load_models(model_dir)
        logger.info(f"Models loaded: {self.models['available']}")

        # Initialize rules engine
        if RULES_ENGINE_AVAILABLE:
            try:
                self.rules_engine = RulesEngine()
                logger.info(f"RulesEngine initialized with {len(self.rules_engine.rules)} rules")
            except Exception as e:
                logger.error(f"Failed to initialize RulesEngine: {e}")
                self.rules_engine = None
        else:
            logger.warning("RulesEngine not available")
            self.rules_engine = None

    def analyze_submission(self, files: List[str], submission_id: str = None) -> AnalysisResult:
        """
        Main entry point: analyze complete submission.

        Args:
            files: List of PDF file paths
            submission_id: Optional submission identifier

        Returns:
            AnalysisResult with complete analysis
        """
        start_time = datetime.utcnow()

        if not submission_id:
            submission_id = f"submission_{int(start_time.timestamp())}"

        logger.info(f"Analyzing submission {submission_id} with {len(files)} files")

        # Process each PDF
        results = []
        for file_path in files:
            try:
                result = self.process_pdf(file_path)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to process {file_path}: {e}", exc_info=True)
                results.append({
                    'file': file_path,
                    'error': str(e),
                    'status': 'failed'
                })

        # Aggregate results
        aggregated = self.aggregate_results(results)

        # Calculate overall confidence
        confidence = self.calculate_confidence(aggregated)

        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()

        # Determine status
        failed_count = sum(1 for r in results if r.get('status') == 'failed')
        if failed_count == len(results):
            status = 'failed'
        elif failed_count > 0:
            status = 'partial'
        else:
            status = 'success'

        return AnalysisResult(
            submission_id=submission_id,
            status=status,
            document_classifications=aggregated.get('classifications', []),
            extracted_dimensions=aggregated.get('dimensions', {}),
            validation_results=aggregated.get('validation', {}),
            violations=aggregated.get('violations', []),
            warnings=aggregated.get('warnings', []),
            overall_confidence=confidence,
            processing_time_seconds=processing_time,
            timestamp=start_time.isoformat() + 'Z',
            metadata=aggregated.get('metadata', {})
        )

    def process_pdf(self, file_path: str) -> Dict[str, Any]:
        """
        Process single PDF file.

        Args:
            file_path: Path to PDF file

        Returns:
            Dictionary with classification, dimensions, metadata
        """
        logger.info(f"Processing PDF: {file_path}")

        result = {
            'file': file_path,
            'status': 'success'
        }

        # Classify document
        try:
            classification = classify_document(file_path, self.models)
            result['classification'] = {
                'type': classification.document_type.value,
                'confidence': classification.confidence,
                'method': classification.method,
                'features': classification.features
            }
        except Exception as e:
            logger.error(f"Classification failed for {file_path}: {e}")
            result['classification_error'] = str(e)

        # Extract dimensions
        try:
            dimensions = extract_dimensions(file_path)
            result['dimensions'] = {
                'setbacks': dimensions.setbacks,
                'heights': dimensions.heights,
                'areas': dimensions.areas,
                'lengths': dimensions.lengths,
                'extraction_method': dimensions.extraction_method,
                'confidence': dimensions.confidence
            }
        except Exception as e:
            logger.error(f"Dimension extraction failed for {file_path}: {e}")
            result['dimensions_error'] = str(e)

        # Extract metadata
        try:
            metadata = extract_metadata(file_path)
            result['metadata'] = metadata
        except Exception as e:
            logger.error(f"Metadata extraction failed for {file_path}: {e}")
            result['metadata_error'] = str(e)

        return result

    def aggregate_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Combine multiple PDF analysis results.

        Args:
            results: List of process_pdf results

        Returns:
            Aggregated analysis data
        """
        logger.info(f"Aggregating {len(results)} results")

        aggregated = {
            'classifications': [],
            'dimensions': {},
            'validation': {},
            'violations': [],
            'warnings': [],
            'metadata': {
                'total_files': len(results),
                'successful_files': sum(1 for r in results if r.get('status') == 'success')
            }
        }

        # Collect all classifications
        for result in results:
            if 'classification' in result:
                aggregated['classifications'].append(result['classification'])

        # Merge dimensions from all documents
        all_dimensions = {
            'setbacks': {},
            'heights': {},
            'areas': {},
            'lengths': {}
        }

        for result in results:
            if 'dimensions' in result:
                dims = result['dimensions']
                for category in ['setbacks', 'heights', 'areas', 'lengths']:
                    if category in dims:
                        all_dimensions[category].update(dims[category])

        aggregated['dimensions'] = all_dimensions

        # Run validation if we have dimensions and rules engine
        if self.rules_engine and any(all_dimensions.values()):
            try:
                # Build data structure for rules engine
                data = self._build_validation_data(all_dimensions)

                # Detect violations
                validation = detect_violations(data, self.rules_engine)
                aggregated['validation'] = validation
                aggregated['violations'] = validation.get('violations', [])
                aggregated['warnings'] = validation.get('warnings', [])
            except Exception as e:
                logger.error(f"Validation failed: {e}", exc_info=True)
                aggregated['validation_error'] = str(e)

        return aggregated

    def calculate_confidence(self, aggregated: Dict[str, Any]) -> float:
        """
        Calculate overall confidence score.

        Args:
            aggregated: Aggregated results from aggregate_results

        Returns:
            Confidence score between 0.0 and 1.0
        """
        scores = []

        # Classification confidence
        classifications = aggregated.get('classifications', [])
        if classifications:
            avg_classification_conf = sum(
                c.get('confidence', 0) for c in classifications
            ) / len(classifications)
            scores.append(avg_classification_conf)

        # Dimension extraction confidence
        dimensions = aggregated.get('dimensions', {})
        if any(dimensions.values()):
            # Count how many dimension categories have data
            categories_with_data = sum(
                1 for cat_data in dimensions.values() if cat_data
            )
            dimension_conf = categories_with_data / 4.0  # 4 categories total
            scores.append(dimension_conf)

        # Validation confidence (based on having validation results)
        if aggregated.get('validation'):
            scores.append(0.9)  # High confidence if validation ran

        # Calculate weighted average
        if not scores:
            return 0.0

        return sum(scores) / len(scores)

    def _build_validation_data(self, dimensions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build data structure for rules engine validation.

        Args:
            dimensions: Extracted dimensions

        Returns:
            Data dictionary compatible with RulesEngine
        """
        data = {
            'building': {
                'setbacks': dimensions.get('setbacks', {}),
                'height_m': dimensions.get('heights', {}).get('building', 0),
                'num_floors': 0,  # TODO: extract from documents
                'total_floor_area_m2': dimensions.get('areas', {}).get('total', 0),
                'footprint_m2': dimensions.get('areas', {}).get('built', 0),
                'use_type': 'residential'  # Default, should be extracted
            },
            'plot': {
                'area_m2': dimensions.get('areas', {}).get('plot', 0),
                'required_setbacks': {},  # Would come from TABA document
                'max_height_m': 0,  # Would come from TABA
                'max_coverage_percent': 0,  # Would come from TABA
                'max_far': 0  # Would come from TABA
            },
            'structural': {
                'columns': [],
                'beams': [],
                'slabs': []
            },
            'location': {}
        }

        # Try to infer number of floors from height
        building_height = dimensions.get('heights', {}).get('building', 0)
        if building_height > 0:
            # Assume 3m per floor
            data['building']['num_floors'] = max(1, int(building_height / 3))

        return data


# ============================================================================
# PDF UTILITIES
# ============================================================================

def validate_pdf(file_path: str) -> bool:
    """
    Check if file is a valid PDF.

    Args:
        file_path: Path to file

    Returns:
        True if valid PDF, False otherwise
    """
    path = Path(file_path)

    # Check file exists
    if not path.exists():
        logger.error(f"File not found: {file_path}")
        return False

    # Check extension
    if path.suffix.lower() != '.pdf':
        logger.error(f"Not a PDF file: {file_path}")
        return False

    # Check file size
    if path.stat().st_size == 0:
        logger.error(f"Empty file: {file_path}")
        return False

    # Try to open with pdfplumber or PyMuPDF
    try:
        if PDFPLUMBER_AVAILABLE:
            with pdfplumber.open(file_path) as pdf:
                if len(pdf.pages) == 0:
                    logger.error(f"PDF has no pages: {file_path}")
                    return False
        elif PYMUPDF_AVAILABLE:
            doc = fitz.open(file_path)
            if doc.page_count == 0:
                logger.error(f"PDF has no pages: {file_path}")
                return False
            doc.close()
        else:
            # No PDF library available, assume valid if extension is correct
            logger.warning("No PDF library available, assuming file is valid")
    except Exception as e:
        logger.error(f"Invalid PDF {file_path}: {e}")
        return False

    return True


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF using pdfplumber or PyMuPDF.

    Args:
        pdf_path: Path to PDF file

    Returns:
        Extracted text
    """
    text = ""

    # Try pdfplumber first (better text extraction)
    if PDFPLUMBER_AVAILABLE:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            logger.info(f"Extracted {len(text)} characters from {pdf_path} using pdfplumber")
            return text
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")

    # Fallback to PyMuPDF
    if PYMUPDF_AVAILABLE:
        try:
            doc = fitz.open(pdf_path)
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
            logger.info(f"Extracted {len(text)} characters from {pdf_path} using PyMuPDF")
            return text
        except Exception as e:
            logger.warning(f"PyMuPDF extraction failed: {e}")

    logger.error(f"No PDF library available for text extraction: {pdf_path}")
    return text


def extract_text_with_ocr(pdf_path: str) -> str:
    """
    Extract text using OCR with pytesseract (fallback method).

    Args:
        pdf_path: Path to PDF file

    Returns:
        OCR-extracted text
    """
    if not PYTESSERACT_AVAILABLE or not PYMUPDF_AVAILABLE:
        logger.warning("OCR not available (missing pytesseract or PyMuPDF)")
        return ""

    text = ""

    try:
        doc = fitz.open(pdf_path)

        for page_num in range(min(5, doc.page_count)):  # OCR first 5 pages only
            page = doc[page_num]

            # Render page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
            img_data = pix.tobytes("png")

            # Convert to PIL Image
            from io import BytesIO
            img = Image.open(BytesIO(img_data))

            # OCR with Hebrew language
            try:
                page_text = pytesseract.image_to_string(img, lang='heb+eng')
                text += page_text + "\n"
            except Exception as e:
                logger.warning(f"OCR failed for page {page_num}: {e}")

        doc.close()
        logger.info(f"OCR extracted {len(text)} characters from {pdf_path}")
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")

    return text


def extract_metadata(pdf_path: str) -> Dict[str, Any]:
    """
    Extract PDF metadata (page count, creation date, title, etc.).

    Args:
        pdf_path: Path to PDF file

    Returns:
        Dictionary with metadata
    """
    metadata = {
        'filename': Path(pdf_path).name,
        'file_size_bytes': 0,
        'page_count': 0,
        'title': '',
        'author': '',
        'creation_date': '',
        'modification_date': ''
    }

    try:
        path = Path(pdf_path)
        metadata['file_size_bytes'] = path.stat().st_size
    except Exception as e:
        logger.warning(f"Failed to get file size: {e}")

    # Extract PDF metadata
    if PDFPLUMBER_AVAILABLE:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                metadata['page_count'] = len(pdf.pages)
                if pdf.metadata:
                    metadata['title'] = pdf.metadata.get('Title', '')
                    metadata['author'] = pdf.metadata.get('Author', '')
                    metadata['creation_date'] = pdf.metadata.get('CreationDate', '')
        except Exception as e:
            logger.warning(f"Failed to extract metadata with pdfplumber: {e}")

    elif PYMUPDF_AVAILABLE:
        try:
            doc = fitz.open(pdf_path)
            metadata['page_count'] = doc.page_count
            meta = doc.metadata
            if meta:
                metadata['title'] = meta.get('title', '')
                metadata['author'] = meta.get('author', '')
                metadata['creation_date'] = meta.get('creationDate', '')
                metadata['modification_date'] = meta.get('modDate', '')
            doc.close()
        except Exception as e:
            logger.warning(f"Failed to extract metadata with PyMuPDF: {e}")

    return metadata


# ============================================================================
# REPORT GENERATION
# ============================================================================

def generate_report(analysis_result: Dict[str, Any]) -> str:
    """
    Generate detailed analysis report.

    Args:
        analysis_result: Analysis results from detect_violations

    Returns:
        Formatted report string
    """
    lines = []
    lines.append("=" * 80)
    lines.append("BUILDING PERMIT ANALYSIS REPORT")
    lines.append("=" * 80)
    lines.append("")

    # Summary
    validation = analysis_result.get('validation_results', {})
    summary = validation.get('summary', {})

    lines.append("SUMMARY")
    lines.append("-" * 80)
    lines.append(f"Total Rules Checked: {summary.get('total_rules', 0)}")
    lines.append(f"Rules Passed: {summary.get('total_passed', 0)}")
    lines.append(f"Rules Failed: {summary.get('total_failed', 0)}")
    lines.append(f"Pass Rate: {summary.get('pass_rate_percent', 0):.1f}%")
    lines.append(f"Total Violations: {summary.get('total_violations', 0)}")
    lines.append(f"Total Warnings: {summary.get('total_warnings', 0)}")
    lines.append("")

    # Violations
    violations = analysis_result.get('violations', [])
    if violations:
        lines.append("VIOLATIONS")
        lines.append("-" * 80)

        # Group by severity
        critical = [v for v in violations if v['severity'] == 'critical']
        high = [v for v in violations if v['severity'] == 'high']
        medium = [v for v in violations if v['severity'] == 'medium']
        low = [v for v in violations if v['severity'] == 'low']

        if critical:
            lines.append(f"\nCRITICAL ({len(critical)}):")
            for v in critical:
                lines.append(f"  - [{v['rule_id']}] {v['message']}")

        if high:
            lines.append(f"\nHIGH ({len(high)}):")
            for v in high:
                lines.append(f"  - [{v['rule_id']}] {v['message']}")

        if medium:
            lines.append(f"\nMEDIUM ({len(medium)}):")
            for v in medium:
                lines.append(f"  - [{v['rule_id']}] {v['message']}")

        if low:
            lines.append(f"\nLOW ({len(low)}):")
            for v in low:
                lines.append(f"  - [{v['rule_id']}] {v['message']}")

        lines.append("")

    # Warnings
    warnings = analysis_result.get('warnings', [])
    if warnings:
        lines.append("WARNINGS")
        lines.append("-" * 80)
        for w in warnings:
            lines.append(f"  - [{w['rule_id']}] {w['message']}")
        lines.append("")

    # Severity score
    total_severity = analysis_result.get('total_severity', 0)
    lines.append(f"Total Severity Score: {total_severity}")
    lines.append("")

    lines.append("=" * 80)

    return "\n".join(lines)


# ============================================================================
# MODULE EXPORTS
# ============================================================================

__all__ = [
    'AnalysisService',
    'DocumentType',
    'ClassificationResult',
    'DimensionData',
    'AnalysisResult',
    'load_models',
    'classify_document',
    'extract_dimensions',
    'detect_violations',
    'parse_dimensions_from_text',
    'extract_metadata',
    'validate_pdf',
    'generate_report'
]
