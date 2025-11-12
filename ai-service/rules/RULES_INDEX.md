# Israeli Building Code Rules Index

Complete listing of all 20 implemented building code validation rules.

## Rule Statistics

| Category | Count | Severity Breakdown |
|----------|-------|-------------------|
| **Structural** | 5 | Critical: 5 |
| **Zoning** | 5 | Critical: 4, High: 1 |
| **Safety** | 5 | Critical: 4, High: 1 |
| **Accessibility** | 3 | Critical: 3 |
| **Environmental** | 2 | High: 1, Medium: 1 |
| **TOTAL** | **20** | **Critical: 16, High: 2, Medium: 1, Low: 1** |

---

## STRUCTURAL RULES (5)

### STR-LOAD-001: Design Loads Verification
- **Name (HE):** אימות עומסי תכנון
- **Name (EN):** Design loads verification
- **Category:** Structural
- **Severity:** CRITICAL
- **Standards:** SI 413
- **Description:** Validates design loads including dead load (≥3.5 kN/m²), live load (2-5 kN/m² by use), wind load (≥0.6 kN/m²), and seismic coefficient (≥0.1)

### STR-FOUND-002: Foundation Depth Minimum
- **Name (HE):** עומק יסוד מינימלי
- **Name (EN):** Foundation depth minimum
- **Category:** Structural
- **Severity:** CRITICAL
- **Standards:** SI 466
- **Description:** Validates foundation depth (≥1.0m) and bearing capacity (≥100 kN/m²) based on soil type

### STR-COLUMN-003: Column Dimensions
- **Name (HE):** מידות עמודים
- **Name (EN):** Column dimensions
- **Category:** Structural
- **Severity:** CRITICAL
- **Standards:** SI 466 Section 7.4.1
- **Description:** Validates column dimensions (≥25cm per side, area ≥625cm² for ≤3 floors, ≥900cm² for >3 floors)

### STR-BEAM-004: Beam Dimensions
- **Name (HE):** מידות קורות
- **Name (EN):** Beam dimensions
- **Category:** Structural
- **Severity:** CRITICAL
- **Standards:** SI 466 Section 9.2.1
- **Description:** Validates beam dimensions (width ≥20cm, height ≥ span/12)

### STR-SLAB-005: Slab Thickness
- **Name (HE):** עובי תקרה
- **Name (EN):** Slab thickness
- **Category:** Structural
- **Severity:** CRITICAL
- **Standards:** SI 466 Section 9.3.1
- **Description:** Validates slab thickness based on type (solid: ≥span/30, ribbed: ≥span/25, absolute minimum: 12cm)

---

## ZONING RULES (5)

### ZON-SETBACK-001: Building Setbacks
- **Name (HE):** נסיגה מגבול המגרש
- **Name (EN):** Building setbacks from property line
- **Category:** Zoning
- **Severity:** CRITICAL
- **Standards:** TABA (תב"ע)
- **Description:** Validates building setbacks from property lines per TABA requirements (all directions)

### ZON-HEIGHT-002: Maximum Building Height
- **Name (HE):** גובה בניין מקסימלי
- **Name (EN):** Maximum building height
- **Category:** Zoning
- **Severity:** CRITICAL
- **Standards:** TABA
- **Description:** Validates building height and number of floors against TABA limits, checks floor height (≥2.6m)

### ZON-COVERAGE-003: Building Coverage Percentage
- **Name (HE):** אחוז כיסוי
- **Name (EN):** Building coverage percentage
- **Category:** Zoning
- **Severity:** CRITICAL
- **Standards:** TABA
- **Description:** Validates building footprint coverage percentage against TABA maximum

### ZON-FAR-004: Floor Area Ratio
- **Name (HE):** תכסית קומות (תב"ע)
- **Name (EN):** Floor Area Ratio (FAR)
- **Category:** Zoning
- **Severity:** CRITICAL
- **Standards:** TABA
- **Description:** Validates total floor area ratio against TABA maximum

### ZON-PARKING-005: Required Parking Spaces
- **Name (HE):** דרישות חניה
- **Name (EN):** Required parking spaces
- **Category:** Zoning
- **Severity:** HIGH
- **Standards:** Local ordinances
- **Description:** Validates parking requirements (1-1.5/unit residential, 1/40m² office, etc.) and accessible spaces (≥5%)

---

## SAFETY RULES (5)

### SAF-FIRE-001: Fire Suppression Requirements
- **Name (HE):** דרישות כיבוי אש
- **Name (EN):** Fire suppression requirements
- **Category:** Safety
- **Severity:** CRITICAL
- **Standards:** SI 1220
- **Description:** Validates fire suppression systems (sprinklers for >4 floors or >12m, extinguishers, alarms)

### SAF-EVAC-002: Emergency Exits
- **Name (HE):** יציאות חירום
- **Name (EN):** Emergency exits
- **Category:** Safety
- **Severity:** CRITICAL
- **Standards:** SI 1220 Part 3
- **Description:** Validates emergency exits (≥2 for >2 floors, width ≥90cm, travel distance ≤30m)

### SAF-STAIR-003: Stairway Dimensions
- **Name (HE):** מידות חדר מדרגות
- **Name (EN):** Stairway dimensions
- **Category:** Safety
- **Severity:** CRITICAL
- **Standards:** SI 1142
- **Description:** Validates stairway dimensions (tread ≥25cm, riser ≤19cm, width ≥120cm, headroom ≥210cm)

### SAF-RAIL-004: Safety Railings
- **Name (HE):** מעקות בטיחות
- **Name (EN):** Safety railings
- **Category:** Safety
- **Severity:** CRITICAL
- **Standards:** SI 1142
- **Description:** Validates railing heights (balcony ≥110cm, stair ≥90cm, spacing ≤12cm, capacity ≥1.5kN)

### SAF-LIGHT-005: Emergency Lighting
- **Name (HE):** תאורת חירום
- **Name (EN):** Emergency lighting
- **Category:** Safety
- **Severity:** HIGH
- **Standards:** SI 1220
- **Description:** Validates emergency lighting (≥90min backup, ≥1 lux, 100% escape route coverage)

---

## ACCESSIBILITY RULES (3)

### ACC-RAMP-001: Ramp Slope
- **Name (HE):** שיפוע רמפה
- **Name (EN):** Ramp slope
- **Category:** Accessibility
- **Severity:** CRITICAL
- **Standards:** Israeli Accessibility Law
- **Description:** Validates ramp slope (≤8.33%, width ≥90cm, landings every 9m, handrails required)

### ACC-DOOR-002: Accessible Door Width
- **Name (HE):** רוחב דלת נגישה
- **Name (EN):** Accessible door width
- **Category:** Accessibility
- **Severity:** CRITICAL
- **Standards:** Israeli Accessibility Law
- **Description:** Validates door dimensions (clear width 80-90cm, threshold ≤2cm, maneuvering space ≥150cm)

### ACC-ELEV-003: Elevator Requirements
- **Name (HE):** דרישות מעלית
- **Name (EN):** Elevator requirements
- **Category:** Accessibility
- **Severity:** CRITICAL
- **Standards:** Israeli Accessibility Law
- **Description:** Validates elevator for >3 floors (car ≥110x140cm, door ≥80cm, Braille controls, audio announcements)

---

## ENVIRONMENTAL RULES (2)

### ENV-ENERGY-001: Green Building Standard
- **Name (HE):** תקן בנייה ירוקה (ת"י 5282)
- **Name (EN):** Green building standard (SI 5282)
- **Category:** Environmental
- **Severity:** HIGH
- **Standards:** SI 5282
- **Description:** Validates energy efficiency (U-values: wall ≤0.5, roof ≤0.35, window ≤2.0 W/m²K, solar water heating for residential, LED ≥80%)

### ENV-NOISE-002: Acoustic Insulation
- **Name (HE):** בידוד אקוסטי
- **Name (EN):** Acoustic insulation
- **Category:** Environmental
- **Severity:** MEDIUM
- **Standards:** SI 1004
- **Description:** Validates sound insulation (walls/floors ≥52dB Rw, impact sound ≤58dB Ln, facade based on external noise)

---

## Usage

All rules are implemented in `ai-service/app/rules_engine.py` and can be validated using:

```python
from app.rules_engine import RulesEngine

# Initialize engine
engine = RulesEngine()

# Validate all rules
results = engine.validate_all(building_data)

# Validate by category
structural_results = engine.validate_by_category('structural', building_data)
```

## Standards Referenced

- **SI 413** - Design Loads
- **SI 466** - Concrete Structures
- **SI 1142** - Safety Railings and Stairways
- **SI 1220** - Fire Safety
- **SI 1004** - Acoustic Insulation
- **SI 5282** - Green Building Standard
- **TABA (תב"ע)** - Zoning Plans
- **Israeli Accessibility Law** - Building accessibility requirements

---

**Last Updated:** 2025-11-12
**Total Rules:** 20
**Implementation:** Python 3.11
**File:** `ai-service/app/rules_engine.py`
