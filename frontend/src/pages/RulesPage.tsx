import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  Shield,
  Building2,
  TreePine,
  Accessibility,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  Info,
  Printer
} from 'lucide-react';

type Category = 'Structural' | 'Zoning' | 'Safety' | 'Accessibility' | 'Environmental';
type Severity = 'High' | 'Medium' | 'Low';

interface RuleReference {
  name: string;
  url: string;
}

interface RuleExample {
  violation: string;
  compliance: string;
}

interface Rule {
  id: string;
  nameHebrew: string;
  nameEnglish: string;
  category: Category;
  severity: Severity;
  descriptionHebrew: string;
  descriptionEnglish: string;
  references: RuleReference[];
  examples: RuleExample[];
  complianceSteps: string[];
}

const RULES_DATA: Rule[] = [
  // STRUCTURAL RULES (5)
  {
    id: 'STR-LOAD-001',
    nameHebrew: 'בדיקת עומסי תכן',
    nameEnglish: 'Design Load Verification',
    category: 'Structural',
    severity: 'High',
    descriptionHebrew: 'בדיקת יכולת המבנה לעמוד בעומסים הנדרשים לפי תקן ישראלי 413 - עומסי תכנון במבנים. כולל עומסים מתים, חיים, רוח, רעידות אדמה ושלג.',
    descriptionEnglish: 'Verification that the structure can withstand required loads per Israeli Standard 413 - Design loads in buildings. Includes dead, live, wind, seismic and snow loads.',
    references: [
      { name: 'תקן ישראלי 413 - עומסי תכנון במבנים', url: 'https://www.sii.org.il' },
      { name: 'תקנות התכנון והבניה (בקשה להיתר, תנאיו ואגרות) התשע"ד-2014', url: 'https://www.gov.il/he/departments/legalInfo/planning-building-regulations' }
    ],
    examples: [
      {
        violation: 'תכנון תקרה בעובי 120 מ"מ עבור מרווח קורות 6 מטר ללא חישוב עומסים',
        compliance: 'תכנון תקרה בעובי 180 מ"מ עם זיוני פלדה מתאימים לפי חישוב עומסים מאושר'
      },
      {
        violation: 'אי התחשבות בעומסי רוח עבור מבנה בגובה 15 קומות',
        compliance: 'חישוב עומסי רוח לפי תקן 413 והתאמת המבנה בהתאם'
      }
    ],
    complianceSteps: [
      'ביצוע חישוב עומסים מפורט על ידי מהנדס מבנים מוסמך',
      'הגשת דו"ח חישוב עומסים חתום ומאושר',
      'וידוא התאמת חתכי אלמנטים קונסטרוקטיביים לעומסים',
      'קבלת אישור ממהנדס הבנייה של הרשות המקומית'
    ]
  },
  {
    id: 'STR-FOUND-002',
    nameHebrew: 'עומק יסודות מינימלי',
    nameEnglish: 'Minimum Foundation Depth',
    category: 'Structural',
    severity: 'High',
    descriptionHebrew: 'עומק יסוד מינימלי של 80 ס"מ מתחת לפני הקרקע הסופיים לפי תקן ישראלי 1225. בקרקעות בעייתיות נדרש דו"ח קרקע גיאוטכני.',
    descriptionEnglish: 'Minimum foundation depth of 80 cm below final ground level per Israeli Standard 1225. Problematic soils require geotechnical soil report.',
    references: [
      { name: 'תקן ישראלי 1225 - יסודות מבנים', url: 'https://www.sii.org.il' },
      { name: 'תקנות הבניה (יסודות) תשל"ח-1978', url: 'https://www.gov.il/he/departments/legalInfo/building-foundations' }
    ],
    examples: [
      {
        violation: 'יסוד בעומק 60 ס"מ ללא סיבה מוצדקת',
        compliance: 'יסוד בעומק 90 ס"מ עם אישור מהנדס קרקע'
      },
      {
        violation: 'בניה על קרקע חרסית ללא דו"ח קרקע',
        compliance: 'ביצוע סקר קרקע גיאוטכני והתאמת היסודות להמלצות'
      }
    ],
    complianceSteps: [
      'ביצוע סקר קרקע גיאוטכני על ידי מהנדס קרקע מוסמך',
      'תכנון יסודות בהתאם להמלצות דו"ח הקרקע',
      'וידוא עומק מינימלי של 80 ס"מ או לפי המלצת מהנדס הקרקע',
      'פיקוח צמוד במהלך חפירת והנחת היסודות'
    ]
  },
  {
    id: 'STR-COLUMN-003',
    nameHebrew: 'מידות עמודים',
    nameEnglish: 'Column Dimensions',
    category: 'Structural',
    severity: 'High',
    descriptionHebrew: 'מידות מינימליות לעמודי בטון: 25×25 ס"מ למבני מגורים עד 4 קומות, 30×30 ס"מ למבנים גבוהים יותר. בהתאם לתקן ישראלי 466.',
    descriptionEnglish: 'Minimum concrete column dimensions: 25×25 cm for residential buildings up to 4 floors, 30×30 cm for taller buildings. Per Israeli Standard 466.',
    references: [
      { name: 'תקן ישראלי 466 - מבני בטון', url: 'https://www.sii.org.il' },
      { name: 'תקנות התכנון והבניה (בניה בבטון) תשמ"ג-1983', url: 'https://www.gov.il/he/departments/legalInfo/concrete-construction' }
    ],
    examples: [
      {
        violation: 'עמוד 20×20 ס"מ במבנה מגורים בן 3 קומות',
        compliance: 'עמוד 25×25 ס"מ עם זיון מתאים לפי חישוב קונסטרוקטור'
      },
      {
        violation: 'שימוש בעמודים 25×25 ס"מ במבנה 8 קומות',
        compliance: 'עמודים 35×35 ס"מ בקומות התחתונות, 30×30 ס"מ בקומות העליונות'
      }
    ],
    complianceSteps: [
      'חישוב עומסים על כל עמוד על ידי מהנדס מבנים',
      'וידוא התאמה למידות מינימליות לפי גובה המבנה',
      'תכנון זיון מתאים לכל עמוד',
      'פיקוח על ביצוע בשטח והתאמה לתכנון'
    ]
  },
  {
    id: 'STR-BEAM-004',
    nameHebrew: 'מידות קורות',
    nameEnglish: 'Beam Dimensions',
    category: 'Structural',
    severity: 'Medium',
    descriptionHebrew: 'יחס גובה לרוחב של קורות בטון: מינימום 1.5:1, מקסימום 3:1. עומק מינימלי של קורה: L/12 (L=מרווח התומכים). לפי תקן ישראלי 466.',
    descriptionEnglish: 'Height to width ratio for concrete beams: minimum 1.5:1, maximum 3:1. Minimum beam depth: L/12 (L=span). Per Israeli Standard 466.',
    references: [
      { name: 'תקן ישראלי 466 - מבני בטון', url: 'https://www.sii.org.il' },
      { name: 'פרק 9 - קורות בבניה', url: 'https://www.standards.org.il' }
    ],
    examples: [
      {
        violation: 'קורה 15×40 ס"מ למרווח של 6 מטר (עומק קטן מדי)',
        compliance: 'קורה 20×50 ס"מ למרווח של 6 מטר (עומק מינימלי 50 ס"מ)'
      },
      {
        violation: 'קורה בעלת יחס גובה-רוחב של 4:1',
        compliance: 'קורה בעלת יחס גובה-רוחב של 2.5:1'
      }
    ],
    complianceSteps: [
      'חישוב מרווחי תומכים ועומסים על כל קורה',
      'וידוא עומק מינימלי של L/12',
      'בדיקת יחס גובה-רוחב (1.5:1 עד 3:1)',
      'תכנון זיון אורכי וטבעות מתאים'
    ]
  },
  {
    id: 'STR-SLAB-005',
    nameHebrew: 'עובי תקרות',
    nameEnglish: 'Slab Thickness',
    category: 'Structural',
    severity: 'Medium',
    descriptionHebrew: 'עובי מינימלי לתקרה מלאה: L/30 (L=מרווח הקורות), מינימום 12 ס"מ. תקרות חלולות: מינימום 20 ס"מ. בהתאם לתקן ישראלי 466.',
    descriptionEnglish: 'Minimum solid slab thickness: L/30 (L=beam spacing), minimum 12 cm. Hollow core slabs: minimum 20 cm. Per Israeli Standard 466.',
    references: [
      { name: 'תקן ישראלי 466 - מבני בטון, פרק תקרות', url: 'https://www.sii.org.il' },
      { name: 'הנחיות לתכנון תקרות בבניה', url: 'https://www.iabse.org.il' }
    ],
    examples: [
      {
        violation: 'תקרה מלאה בעובי 10 ס"מ למרווח קורות 4 מטר',
        compliance: 'תקרה מלאה בעובי 14 ס"מ למרווח קורות 4 מטר (מינימום L/30=13.3 ס"מ)'
      },
      {
        violation: 'תקרה חלולה 18 ס"מ',
        compliance: 'תקרה חלולה 22 ס"מ (מינימום 20 ס"מ)'
      }
    ],
    complianceSteps: [
      'חישוב עומסים על התקרה',
      'קביעת עובי תקרה מינימלי לפי L/30',
      'וידוא עובי מינימלי של 12 ס"מ (תקרה מלאה) או 20 ס"מ (תקרה חלולה)',
      'תכנון זיון התקרה בהתאם'
    ]
  },

  // ZONING RULES (5)
  {
    id: 'ZON-SETBACK-001',
    nameHebrew: 'מרחקי בניין מגבול',
    nameEnglish: 'Building Setback Requirements',
    category: 'Zoning',
    severity: 'High',
    descriptionHebrew: 'מרחק מינימלי מגבול המגרש: חזית - 5 מטר, צדדים - 3 מטר, אחור - 4 מטר. משתנה לפי תב"ע וחוקי עזר מקומיים.',
    descriptionEnglish: 'Minimum setback from property line: front - 5m, sides - 3m, rear - 4m. Varies by local master plan and bylaws.',
    references: [
      { name: 'חוק התכנון והבניה, תשכ"ה-1965', url: 'https://www.gov.il/he/departments/legalInfo/planning-building-law' },
      { name: 'תקנות התכנון והבניה (מרחקים מגבולות וקווי בנין)', url: 'https://www.nevo.co.il/law_html/law01/126_001.htm' }
    ],
    examples: [
      {
        violation: 'בניה במרחק 2 מטר מקו גבול צדדי',
        compliance: 'בניה במרחק 3 מטר מקו גבול צדדי לפי תב"ע'
      },
      {
        violation: 'הצמדת מבנה לגבול אחורי',
        compliance: 'שמירה על מרחק 4 מטר מגבול אחורי'
      }
    ],
    complianceSteps: [
      'בדיקת תב"ע החלה על המגרש',
      'עיון בחוקי עזר של הרשות המקומית',
      'תכנון המבנה בהתאם למרחקי בנין נדרשים',
      'סימון מרחקים בתוכנית האתר'
    ]
  },
  {
    id: 'ZON-HEIGHT-002',
    nameHebrew: 'גובה מבנה מקסימלי',
    nameEnglish: 'Maximum Building Height',
    category: 'Zoning',
    severity: 'High',
    descriptionHebrew: 'גובה מבנה מקסימלי נקבע לפי תב"ע. בדרך כלל: אזורי מגורים - 4 קומות (15 מטר), מרכזי ערים - עד 25 קומות. כולל קומת קרקע ומסד.',
    descriptionEnglish: 'Maximum building height determined by master plan. Typically: residential areas - 4 floors (15m), city centers - up to 25 floors. Includes ground floor and foundation.',
    references: [
      { name: 'חוק התכנון והבניה - הגבלות גובה', url: 'https://www.gov.il/he/departments/legalInfo/building-height' },
      { name: 'תב"ע מקומית', url: 'https://mavat.iplan.gov.il' }
    ],
    examples: [
      {
        violation: 'תכנון בניין 5 קומות באזור המוגבל ל-4 קומות',
        compliance: 'תכנון בניין 4 קומות בהתאם לתב"ע'
      },
      {
        violation: 'בניה בגובה 18 מטר באזור מוגבל ל-15 מטר',
        compliance: 'הפחתת גובה ל-15 מטר או הגשת בקשה לשינוי תב"ע'
      }
    ],
    complianceSteps: [
      'בדיקת תב"ע החלה על המגרש במאגר מידע מרחבי (מפ"ת)',
      'זיהוי מגבלות גובה ומספר קומות',
      'תכנון המבנה בהתאם למגבלות',
      'וידוא שגובה כל קומה תקני (מינימום 2.5 מטר)'
    ]
  },
  {
    id: 'ZON-COVERAGE-003',
    nameHebrew: 'אחוז בניה',
    nameEnglish: 'Building Coverage Ratio',
    category: 'Zoning',
    severity: 'Medium',
    descriptionHebrew: 'אחוז הכיסוי המקסימלי של המגרש במבנים. משתנה לפי תב"ע: מגורים - 30-50%, מסחרי - 50-70%. כולל כל המבנים במגרש.',
    descriptionEnglish: 'Maximum percentage of lot covered by buildings. Varies by master plan: residential - 30-50%, commercial - 50-70%. Includes all structures on lot.',
    references: [
      { name: 'חוק התכנון והבניה - אחוזי בניה', url: 'https://www.gov.il/he/departments/legalInfo/building-coverage' },
      { name: 'תקנות התכנון והבניה (אחוזי בניה)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'תכנון בניה בשטח 400 מ"ר על מגרש 700 מ"ר (57%) כאשר מותר 50%',
        compliance: 'הפחתת שטח בניה ל-350 מ"ר (50% מהמגרש)'
      },
      {
        violation: 'אי כלילת מרפסות ומחסנים בחישוב אחוז הבניה',
        compliance: 'חישוב אחוז בניה כולל כל המבנים והמבנים העזר'
      }
    ],
    complianceSteps: [
      'מדידת שטח המגרש המדויק',
      'בדיקת אחוז הבניה המותר בתב"ע',
      'חישוב שטח כל המבנים והמבנים העזר',
      'וידוא שאחוז הבניה אינו עולה על המותר'
    ]
  },
  {
    id: 'ZON-FAR-004',
    nameHebrew: 'אחוז קומות (תב"ע)',
    nameEnglish: 'Floor Area Ratio (FAR)',
    category: 'Zoning',
    severity: 'Medium',
    descriptionHebrew: 'יחס בין שטח הבניה הכולל לשטח המגרש. לדוגמה: תב"ע 200% = מותר לבנות שטח כולל של פי 2 משטח המגרש. כולל כל הקומות.',
    descriptionEnglish: 'Ratio between total building area and lot area. Example: 200% FAR = allowed to build total area of 2x lot size. Includes all floors.',
    references: [
      { name: 'חוק התכנון והבניה - זכויות בניה', url: 'https://www.gov.il/he/departments/legalInfo/building-rights' },
      { name: 'מדריך לחישוב זכויות בניה', url: 'https://www.iplan.gov.il' }
    ],
    examples: [
      {
        violation: 'תכנון 1200 מ"ר בניה על מגרש 500 מ"ר כאשר תב"ע מתירה 200% (1000 מ"ר)',
        compliance: 'הפחתת שטח הבניה הכולל ל-1000 מ"ר'
      },
      {
        violation: 'אי כלילת קומת מרתף בחישוב שטחים',
        compliance: 'חישוב כולל את כל הקומות כולל מרתף וקומת עמודים'
      }
    ],
    complianceSteps: [
      'בדיקת אחוז הקומות המותר בתב"ע',
      'חישוב שטח כל קומה (כולל מרתף, עמודים, גג)',
      'חישוב סך שטחי הבניה',
      'וידוא שאחוז הקומות אינו עולה על המותר'
    ]
  },
  {
    id: 'ZON-PARKING-005',
    nameHebrew: 'חניות נדרשות',
    nameEnglish: 'Required Parking Spaces',
    category: 'Zoning',
    severity: 'High',
    descriptionHebrew: 'מספר חניות מינימלי לפי תקן תכנון 470: מגורים - 1.5 חניות לדירה, משרדים - 1 חניה ל-50 מ"ר, מסחרי - 1 חניה ל-40 מ"ר. משתנה לפי אזור.',
    descriptionEnglish: 'Minimum parking spaces per Planning Standard 470: residential - 1.5 per unit, offices - 1 per 50 sqm, retail - 1 per 40 sqm. Varies by area.',
    references: [
      { name: 'תקן תכנון 470 - חניה', url: 'https://www.gov.il/he/departments/policies/parking_standard' },
      { name: 'תקנות התכנון והבניה (חניה)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'תכנון 20 דירות עם 25 חניות (פחות מ-1.5 לדירה)',
        compliance: 'תכנון 20 דירות עם לפחות 30 חניות (1.5 לדירה)'
      },
      {
        violation: 'בניין משרדים 2000 מ"ר עם 30 חניות',
        compliance: 'בניין משרדים 2000 מ"ר עם 40 חניות (1 ל-50 מ"ר)'
      }
    ],
    complianceSteps: [
      'חישוב מספר יחידות דיור או שטחים לפי ייעוד',
      'בדיקת דרישות חניה בתקן 470 ובחוקי עזר מקומיים',
      'תכנון מספר חניות מספיק',
      'תכנון חניות נגישות (5% מסך החניות)'
    ]
  },

  // SAFETY RULES (5)
  {
    id: 'SAF-FIRE-001',
    nameHebrew: 'דרישות כיבוי אש',
    nameEnglish: 'Fire Safety Requirements',
    category: 'Safety',
    severity: 'High',
    descriptionHebrew: 'מערכות כיבוי אש חובה בבניינים מעל 4 קומות. כולל: גלאי עשן, ספרינקלרים, ברזי כיבוי, לחצני חירום. לפי תקן ישראלי 1596 ותקנות כיבוי אש.',
    descriptionEnglish: 'Fire suppression systems required in buildings over 4 floors. Includes: smoke detectors, sprinklers, fire hose cabinets, emergency buttons. Per Israeli Standard 1596 and fire regulations.',
    references: [
      { name: 'תקן ישראלי 1596 - מתקני כיבוי אש', url: 'https://www.sii.org.il' },
      { name: 'פקודת מניעת דליקות - חוקי עזר', url: 'https://www.fireservice.gov.il' },
      { name: 'תקנות התכנון והבניה (בטיחות אש)', url: 'https://www.gov.il/he/departments/legalInfo/fire-safety' }
    ],
    examples: [
      {
        violation: 'בניין 6 קומות ללא מערכת ספרינקלרים',
        compliance: 'התקנת מערכת ספרינקלרים בכל הקומות עם מאגר מים ייעודי'
      },
      {
        violation: 'פיר מדרגות ללא גלאי עשן',
        compliance: 'התקנת גלאי עשן בכל קומה בפיר המדרגות המחוברים למרכזיית כיבוי'
      }
    ],
    complianceSteps: [
      'תכנון מערכת כיבוי מלאה על ידי יועץ כיבוי אש מוסמך',
      'התקנת גלאי עשן בכל חדר וממ"ד',
      'התקנת ספרינקלרים בבניינים מעל 4 קומות',
      'וידוא קיום ברזי כיבוי בחדרי מדרגות',
      'קבלת אישור ממשרד הכבאות והצלה'
    ]
  },
  {
    id: 'SAF-EVAC-002',
    nameHebrew: 'יציאות חירום',
    nameEnglish: 'Emergency Exits',
    category: 'Safety',
    severity: 'High',
    descriptionHebrew: 'לפחות 2 יציאות חירום נפרדות לכל קומה. רוחב מינימלי 1.2 מטר. דלת נפתחת כיוון הבריחה. שילוט פוטו-לומינסנטי. לפי תקן ישראלי 1220.',
    descriptionEnglish: 'At least 2 separate emergency exits per floor. Minimum width 1.2m. Door opens in direction of escape. Photoluminescent signage. Per Israeli Standard 1220.',
    references: [
      { name: 'תקן ישראלי 1220 - יציאות חירום', url: 'https://www.sii.org.il' },
      { name: 'תקנות התכנון והבניה (דרכי מילוט)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'קומה עם יציאת חירום אחת בלבד',
        compliance: 'תכנון 2 יציאות חירום נפרדות בקצוות מנוגדים של הקומה'
      },
      {
        violation: 'דלת חירום ברוחב 90 ס"מ',
        compliance: 'דלת חירום ברוחב 120 ס"מ עם מנגנון פאניקה'
      }
    ],
    complianceSteps: [
      'זיהוי כל חללי השימוש והתעסוקה',
      'תכנון לפחות 2 יציאות חירום נפרדות',
      'וידוא רוחב מינימלי 1.2 מטר',
      'תכנון דלתות הנפתחות כיוון הבריחה',
      'שילוט פוטו-לומינסנטי לכל דרכי המילוט'
    ]
  },
  {
    id: 'SAF-STAIR-003',
    nameHebrew: 'מידות מדרגות',
    nameEnglish: 'Stairway Dimensions',
    category: 'Safety',
    severity: 'Medium',
    descriptionHebrew: 'מידות מדרגה: מדרך (tread) 25-30 ס"מ, סוגר (riser) 15-17 ס"מ. נוסחה: 2×סוגר + מדרך = 60-64 ס"מ. רוחב מינימלי 1.2 מטר. לפי תקן ישראלי 1918.',
    descriptionEnglish: 'Stair dimensions: tread 25-30 cm, riser 15-17 cm. Formula: 2×riser + tread = 60-64 cm. Minimum width 1.2m. Per Israeli Standard 1918.',
    references: [
      { name: 'תקן ישראלי 1918 - מדרגות', url: 'https://www.sii.org.il' },
      { name: 'תקנות התכנון והבניה (מדרגות ומעליות)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'מדרגות עם סוגר 20 ס"מ ומדרך 22 ס"מ (לא עומד בנוסחה)',
        compliance: 'מדרגות עם סוגר 16 ס"מ ומדרך 28 ס"מ (2×16+28=60)'
      },
      {
        violation: 'חדר מדרגות ברוחב 100 ס"מ',
        compliance: 'חדר מדרגות ברוחב 130 ס"מ'
      }
    ],
    complianceSteps: [
      'תכנון מידות מדרגה לפי הנוסחה: 2×סוגר + מדרך = 60-64 ס"מ',
      'וידוא מדרך 25-30 ס"מ וסוגר 15-17 ס"מ',
      'רוחב חדר מדרגות מינימום 1.2 מטר',
      'תכנון מנוחה כל 12-16 מדרגות',
      'מעקה בטיחות בגובה 1.0 מטר'
    ]
  },
  {
    id: 'SAF-RAIL-004',
    nameHebrew: 'מעקות בטיחות',
    nameEnglish: 'Safety Railings',
    category: 'Safety',
    severity: 'High',
    descriptionHebrew: 'מעקה חובה בכל הפרש גובה מעל 50 ס"מ. גובה מינימלי 1.0 מטר (1.1 במוסדות חינוך). מרווח מקסימלי בין מוטות 12 ס"מ. לפי תקן ישראלי 1142.',
    descriptionEnglish: 'Railing required at any height difference over 50 cm. Minimum height 1.0m (1.1m in educational facilities). Maximum gap between bars 12 cm. Per Israeli Standard 1142.',
    references: [
      { name: 'תקן ישראלי 1142 - מעקות', url: 'https://www.sii.org.il' },
      { name: 'תקנות הבטיחות בעבודה (מעקות)', url: 'https://www.gov.il/he/departments/legalInfo/safety-railings' }
    ],
    examples: [
      {
        violation: 'מרפסת ללא מעקה בגובה 1.2 מטר מהקרקע',
        compliance: 'התקנת מעקה בגובה 1.05 מטר במרפסת'
      },
      {
        violation: 'מעקה עם מרווח 15 ס"מ בין מוטות',
        compliance: 'מעקה עם מרווח 11 ס"מ בין מוטות'
      }
    ],
    complianceSteps: [
      'זיהוי כל הפרשי גובה מעל 50 ס"מ',
      'תכנון מעקה בגובה מינימלי 1.0 מטר',
      'וידוא מרווח מקסימלי 12 ס"מ בין מוטות',
      'בדיקת יכולת עמידה בעומס אופקי 75 ק"ג/מ"א',
      'במוסדות חינוך - גובה 1.1 מטר'
    ]
  },
  {
    id: 'SAF-LIGHT-005',
    nameHebrew: 'תאורת חירום',
    nameEnglish: 'Emergency Lighting',
    category: 'Safety',
    severity: 'Medium',
    descriptionHebrew: 'תאורת חירום חובה בחדרי מדרגות, מסדרונות, יציאות. הספק מינימלי 5 לוקס. זמן הפעלה מינימלי 90 דקות. מופעלת אוטומטית בהפסקת חשמל. לפי תקן ישראלי 5012.',
    descriptionEnglish: 'Emergency lighting required in stairwells, corridors, exits. Minimum illumination 5 lux. Minimum operation 90 minutes. Automatic activation on power failure. Per Israeli Standard 5012.',
    references: [
      { name: 'תקן ישראלי 5012 - תאורת חירום', url: 'https://www.sii.org.il' },
      { name: 'תקנות חשמל (תאורת חירום)', url: 'https://www.gov.il/he/departments/legalInfo/emergency-lighting' }
    ],
    examples: [
      {
        violation: 'חדר מדרגות ללא תאורת חירום',
        compliance: 'התקנת גופי תאורת חירום LED עם סוללות גיבוי'
      },
      {
        violation: 'תאורת חירום עם זמן הפעלה 30 דקות',
        compliance: 'שדרוג למערכת עם סוללות לזמן הפעלה 90 דקות'
      }
    ],
    complianceSteps: [
      'זיהוי כל דרכי המילוט והחללים הציבוריים',
      'תכנון מיקום גופי תאורת חירום',
      'וידוא הספק מינימלי 5 לוקס',
      'בחירת גופים עם סוללות ל-90 דקות פעולה',
      'חיבור למערכת הפעלה אוטומטית'
    ]
  },

  // ACCESSIBILITY RULES (3)
  {
    id: 'ACC-RAMP-001',
    nameHebrew: 'שיפוע רמפות',
    nameEnglish: 'Ramp Slope Requirements',
    category: 'Accessibility',
    severity: 'High',
    descriptionHebrew: 'שיפוע מקסימלי לרמפה נגישה: 1:12 (8.33%). באזור כניסה: 1:20 (5%). אורך מקסימלי ללא מנוחה: 9 מטר. רוחב מינימלי: 1.2 מטר. לפי תקן ישראלי 1918 חלק 2.',
    descriptionEnglish: 'Maximum accessible ramp slope: 1:12 (8.33%). Entrance area: 1:20 (5%). Maximum length without landing: 9m. Minimum width: 1.2m. Per Israeli Standard 1918 Part 2.',
    references: [
      { name: 'תקן ישראלי 1918 חלק 2 - נגישות', url: 'https://www.sii.org.il' },
      { name: 'חוק שוויון זכויות לאנשים עם מוגבלות', url: 'https://www.gov.il/he/departments/legalInfo/accessibility-law' },
      { name: 'תקנות התכנון והבניה (נגישות)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'רמפה בשיפוע 1:10 (10%) לכניסה למבנה',
        compliance: 'רמפה בשיפוע 1:12 (8.33%) עם מנוחה כל 9 מטר'
      },
      {
        violation: 'רמפה באורך 12 מטר ללא מנוחה',
        compliance: 'רמפה עם מנוחה אחרי 9 מטר, מנוחה באורך 1.5 מטר'
      }
    ],
    complianceSteps: [
      'חישוב הפרש גובה הנדרש לגישור',
      'תכנון רמפה בשיפוע מקסימלי 1:12',
      'תכנון מנוחה כל 9 מטר (1.5×1.5 מטר)',
      'וידוא רוחב מינימלי 1.2 מטר',
      'התקנת מעקה בשני צידי הרמפה בגובה 90 ס"מ'
    ]
  },
  {
    id: 'ACC-DOOR-002',
    nameHebrew: 'רוחב דלתות נגישות',
    nameEnglish: 'Accessible Door Width',
    category: 'Accessibility',
    severity: 'High',
    descriptionHebrew: 'רוחב מינימלי נטו לדלת נגישה: 90 ס"מ. כניסה ראשית: 1.0 מטר. גובה מינימלי: 2.0 מטר. מרווח חופשי 1.5×1.5 מטר לפני ואחרי הדלת. לפי תקן ישראלי 1918 חלק 2.',
    descriptionEnglish: 'Minimum clear door width: 90 cm. Main entrance: 1.0m. Minimum height: 2.0m. Clear space 1.5×1.5m before and after door. Per Israeli Standard 1918 Part 2.',
    references: [
      { name: 'תקן ישראלי 1918 חלק 2 - נגישות', url: 'https://www.sii.org.il' },
      { name: 'חוק שוויון זכויות - תקנות נגישות', url: 'https://www.gov.il/he/departments/legalInfo/accessibility' }
    ],
    examples: [
      {
        violation: 'דלת כניסה ראשית ברוחב 80 ס"מ',
        compliance: 'דלת כניסה ראשית ברוחב 100 ס"מ'
      },
      {
        violation: 'דלת שירותים נגישים ברוחב 85 ס"מ',
        compliance: 'דלת שירותים נגישים ברוחב 90 ס"מ עם ידית מסוג מוט'
      }
    ],
    complianceSteps: [
      'תכנון דלתות בכניסה ראשית ברוחב 1.0 מטר',
      'דלתות פנימיות ברוחב מינימלי 90 ס"מ',
      'תכנון מרווח חופשי 1.5×1.5 מטר לפני ואחרי כל דלת',
      'התקנת ידיות מסוג מוט בגובה 90-110 ס"מ',
      'מנגנון סגירה אוטומטית איטית'
    ]
  },
  {
    id: 'ACC-ELEV-003',
    nameHebrew: 'דרישות מעלית',
    nameEnglish: 'Elevator Requirements',
    category: 'Accessibility',
    severity: 'High',
    descriptionHebrew: 'מעלית נגישה חובה בבניינים מעל 2 קומות. מידות תא מינימליות: 1.1×1.4 מטר. דלת רוחב מינימלי: 90 ס"מ. כפתורים בגובה 90-120 ס"מ. לפי תקן ישראלי 1803.',
    descriptionEnglish: 'Accessible elevator required in buildings over 2 floors. Minimum cabin dimensions: 1.1×1.4m. Door minimum width: 90 cm. Buttons at height 90-120 cm. Per Israeli Standard 1803.',
    references: [
      { name: 'תקן ישראלי 1803 - מעליות', url: 'https://www.sii.org.il' },
      { name: 'תקנות התכנון והבניה (מעליות)', url: 'https://www.nevo.co.il' },
      { name: 'הנחיות נגישות למעליות', url: 'https://www.kolzchut.org.il' }
    ],
    examples: [
      {
        violation: 'בניין 4 קומות ללא מעלית',
        compliance: 'התקנת מעלית נגישה עם תא 1.2×1.5 מטר'
      },
      {
        violation: 'מעלית עם דלת ברוחב 80 ס"מ',
        compliance: 'החלפת דלת לרוחב 90 ס"מ עם חיישני בטיחות'
      }
    ],
    complianceSteps: [
      'תכנון מעלית בבניינים מעל 2 קומות',
      'וידוא מידות תא מינימליות: 1.1×1.4 מטר',
      'דלת רוחב מינימלי 90 ס"מ',
      'כפתורים בגובה 90-120 ס"מ עם סימון ברייל',
      'מראה מלאה בגובה 40 ס"מ מהרצפה',
      'מעקה תמיכה בגובה 90 ס"מ'
    ]
  },

  // ENVIRONMENTAL RULES (2)
  {
    id: 'ENV-ENERGY-001',
    nameHebrew: 'תקן ירוק (SI 5282)',
    nameEnglish: 'Green Building Standard (SI 5282)',
    category: 'Environmental',
    severity: 'Medium',
    descriptionHebrew: 'תקן בניה ירוקה SI 5282 חובה בבניינים חדשים. דרישות: בידוד תרמי משופר, דוד שמש, זכוכית כפולה, מערכת הצללה, חיסכון במים. דירוג מינימלי: 2 כוכבים.',
    descriptionEnglish: 'Green building standard SI 5282 mandatory for new buildings. Requirements: improved thermal insulation, solar water heater, double glazing, shading system, water conservation. Minimum rating: 2 stars.',
    references: [
      { name: 'תקן ישראלי 5282 - בניה ירוקה', url: 'https://www.sii.org.il/5282' },
      { name: 'תקנות התכנון והבניה (בניה ירוקה)', url: 'https://www.gov.il/he/departments/legalInfo/green-building' },
      { name: 'מדריך תו תקן ירוק', url: 'https://www.sviva.gov.il/greenbuilding' }
    ],
    examples: [
      {
        violation: 'בניין חדש ללא דוד שמש',
        compliance: 'התקנת דוד שמש בנפח מתאים (50 ליטר לנפש)'
      },
      {
        violation: 'זכוכית בודדת בחזיתות',
        compliance: 'זכוכית כפולה עם ציפוי Low-E בכל החלונות'
      }
    ],
    complianceSteps: [
      'תכנון בידוד תרמי משופר בקירות וגג (U-value מופחת)',
      'התקנת דוד שמש - 50 ליטר לנפש',
      'זכוכית כפולה בכל החלונות עם ציפוי Low-E',
      'מערכת הצללה חיצונית בחזית דרום/מערב',
      'אינסטלציה חוסכת מים (ברזים, מקלחות, אסלות)',
      'הכנה לפאנלים סולאריים (צנרת + תשתית חשמל)',
      'הגשת תכנית לתו תקן ירוק 2 כוכבים לפחות'
    ]
  },
  {
    id: 'ENV-NOISE-002',
    nameHebrew: 'בידוד רעש',
    nameEnglish: 'Acoustic Insulation',
    category: 'Environmental',
    severity: 'Low',
    descriptionHebrew: 'בידוד אקוסטי לפי תקן ישראלי 1004: מחיצה בין דירות - מינימום 55 דציבל. תקרה בין דירות - מינימום 55 דציבל. חלון לרחוב - מינימום 30 דציבל.',
    descriptionEnglish: 'Acoustic insulation per Israeli Standard 1004: partition between units - minimum 55 dB. Floor between units - minimum 55 dB. Window to street - minimum 30 dB.',
    references: [
      { name: 'תקן ישראלי 1004 - בידוד אקוסטי', url: 'https://www.sii.org.il' },
      { name: 'תקנות התכנון והבניה (בידוד אקוסטי)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'קיר בלוקים 20 ס"מ בין דירות (בידוד ~45 דציבל)',
        compliance: 'קיר כפול עם מילוי צמר סלעים (בידוד 58 דציבל)'
      },
      {
        violation: 'תקרה רגילה בין דירות ללא בידוד',
        compliance: 'תקרה + רצפה צפה + תקרה אקוסטית (בידוד 57 דציבל)'
      }
    ],
    complianceSteps: [
      'בדיקת דרישות בידוד אקוסטי לפי סוג המבנה',
      'תכנון קירות כפולים בין דירות עם מילוי בידוד',
      'תכנון רצפה צפה או תקרה אקוסטית בין קומות',
      'בחירת חלונות עם זכוכית אקוסטית לחזיתות רועשות',
      'בידוד צנרת ומערכות מכניות',
      'ביצוע מדידות אקוסטיות בסיום הבנייה'
    ]
  },

  // ADDITIONAL RULES TO REACH 20+
  {
    id: 'STR-REINF-006',
    nameHebrew: 'כיסוי זיון בטון',
    nameEnglish: 'Concrete Cover for Reinforcement',
    category: 'Structural',
    severity: 'Medium',
    descriptionHebrew: 'כיסוי מינימלי לזיון בטון: יסודות - 75 מ"מ, קירות - 25 מ"מ, תקרות - 15 מ"מ, קורות - 25 מ"מ. בסביבה אגרסיבית - הגדלה ב-50%. לפי תקן ישראלי 466.',
    descriptionEnglish: 'Minimum concrete cover: foundations - 75mm, walls - 25mm, slabs - 15mm, beams - 25mm. Aggressive environment - increase by 50%. Per Israeli Standard 466.',
    references: [
      { name: 'תקן ישראלי 466 חלק 1 - כיסוי זיון', url: 'https://www.sii.org.il' }
    ],
    examples: [
      {
        violation: 'כיסוי זיון 15 מ"מ ביסוד',
        compliance: 'כיסוי זיון 75 מ"מ ביסוד עם שימוש בספייסרים'
      }
    ],
    complianceSteps: [
      'זיהוי סוג האלמנט והסביבה',
      'קביעת כיסוי מינימלי נדרש',
      'שימוש בספייסרים מתאימים',
      'פיקוח צמוד במהלך יציקת הבטון'
    ]
  },
  {
    id: 'ZON-BALC-006',
    nameHebrew: 'שטח מרפסות',
    nameEnglish: 'Balcony Area',
    category: 'Zoning',
    severity: 'Low',
    descriptionHebrew: 'שטח מרפסת מקסימלי לא ייספר בזכויות הבניה: עד 10 מ"ר או 20% משטח הדירה (הנמוך מבניהם). מרפסת מעבר לכך נספרת בזכויות. לפי תקנות התכנון והבניה.',
    descriptionEnglish: 'Maximum balcony area not counted in building rights: up to 10 sqm or 20% of apartment area (whichever is less). Beyond that counted in rights. Per planning regulations.',
    references: [
      { name: 'תקנות התכנון והבניה (חישוב שטחים)', url: 'https://www.nevo.co.il' }
    ],
    examples: [
      {
        violation: 'דירה 80 מ"ר עם מרפסת 25 מ"ר הנספרת כולה כ"לא נספר"',
        compliance: 'דירה 80 מ"ר עם מרפסת 25 מ"ר: 10 מ"ר לא נספר, 15 מ"ר נספר'
      }
    ],
    complianceSteps: [
      'חישוב שטח כל דירה',
      'חישוב 20% משטח הדירה',
      'השוואה ל-10 מ"ר והנמוך מבניהם הוא השטח הבלתי נספר',
      'הכללת יתרת שטח המרפסת בזכויות הבניה'
    ]
  },
  {
    id: 'SAF-MAMAD-006',
    nameHebrew: 'ממ"ד (מרחב מוגן דירתי)',
    nameEnglish: 'Protected Space (Shelter)',
    category: 'Safety',
    severity: 'High',
    descriptionHebrew: 'חובת ממ"ד בכל דירה חדשה. מידות מינימליות: 9 מ"ר (3×3 מטר). קירות בטון 25 ס"מ, תקרה 25 ס"מ. דלת פלדה, חלון עם תריס פלדה. לפי פקודת ההגנה האזרחית.',
    descriptionEnglish: 'Protected space required in every new apartment. Minimum size: 9 sqm (3×3m). Concrete walls 25 cm, ceiling 25 cm. Steel door, window with steel shutter. Per Civil Defense Ordinance.',
    references: [
      { name: 'פקודת ההגנה האזרחית - תקנות ממ"ד', url: 'https://www.oref.org.il' },
      { name: 'תקן ישראלי 4570 - מרחבים מוגנים', url: 'https://www.sii.org.il' }
    ],
    examples: [
      {
        violation: 'ממ"ד בשטח 7 מ"ר',
        compliance: 'ממ"ד בשטח 9 מ"ר עם מידות 3×3 מטר'
      },
      {
        violation: 'קירות ממ"ד בעובי 20 ס"מ',
        compliance: 'קירות ממ"ד בעובי 25 ס"מ בטון מזוין'
      }
    ],
    complianceSteps: [
      'תכנון ממ"ד בשטח מינימלי 9 מ"ר',
      'קירות וסלילה בטון 25 ס"מ',
      'דלת פלדה הנפתחת כלפי חוץ',
      'חלון עם תריס פלדה חיצוני',
      'מערכת סינון אוויר (ארון סינון)',
      'נקודת מים וחשמל'
    ]
  },
  {
    id: 'ACC-BATH-004',
    nameHebrew: 'שירותים נגישים',
    nameEnglish: 'Accessible Restrooms',
    category: 'Accessibility',
    severity: 'High',
    descriptionHebrew: 'שירותים נגישים בכל מבנה ציבורי. מידות מינימליות: 1.7×2.2 מטר. מעקות תמיכה ליד אסלה, כיור בגובה 80 ס"מ. דלת רוחב 90 ס"מ. לפי תקן ישראלי 1918.',
    descriptionEnglish: 'Accessible restrooms in every public building. Minimum dimensions: 1.7×2.2m. Support rails near toilet, sink at 80 cm height. Door width 90 cm. Per Israeli Standard 1918.',
    references: [
      { name: 'תקן ישראלי 1918 חלק 2 - שירותים נגישים', url: 'https://www.sii.org.il' }
    ],
    examples: [
      {
        violation: 'שירותים נגישים בשטח 1.4×1.8 מטר',
        compliance: 'שירותים נגישים בשטח 1.8×2.3 מטר עם מעקות תמיכה'
      }
    ],
    complianceSteps: [
      'תכנון תא שירותים במידות 1.7×2.2 מטר לפחות',
      'מעקות תמיכה בצידי האסלה',
      'כיור בגובה 80 ס"מ עם ברז מוט',
      'ראי בגובה מותאם (80-180 ס"מ)',
      'לחצני קריאה לעזרה'
    ]
  },
  {
    id: 'ENV-WATER-003',
    nameHebrew: 'חיסכון במים',
    nameEnglish: 'Water Conservation',
    category: 'Environmental',
    severity: 'Low',
    descriptionHebrew: 'אינסטלציה חוסכת מים חובה. ברזים: 6 ליטר/דקה מקסימום. ראש מקלחת: 8 ליטר/דקה. אסלה: 6/3 ליטר להדחה. ציסטרנה אפורים מומלץ. לפי תקן ישראלי 1385.',
    descriptionEnglish: 'Water-saving plumbing mandatory. Faucets: 6 L/min max. Shower head: 8 L/min. Toilet: 6/3 L flush. Greywater system recommended. Per Israeli Standard 1385.',
    references: [
      { name: 'תקן ישראלי 1385 - חיסכון במים', url: 'https://www.sii.org.il' },
      { name: 'תקנות מים (חיסכון במים)', url: 'https://www.water.gov.il' }
    ],
    examples: [
      {
        violation: 'ברזים רגילים בזרימה 12 ליטר/דקה',
        compliance: 'ברזים עם מפחית זרימה 6 ליטר/דקה'
      }
    ],
    complianceSteps: [
      'בחירת ברזים עם מפחית זרימה (6 ל/דקה)',
      'ראשי מקלחת חוסכים (8 ל/דקה)',
      'אסלות דו-כמותיות (6/3 ליטר)',
      'שקול מערכת מים אפורים לגינון/שטיפה'
    ]
  }
];

const RulesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'All'>('All');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const categories: Array<Category | 'All'> = ['All', 'Structural', 'Zoning', 'Safety', 'Accessibility', 'Environmental'];
  const severities: Array<Severity | 'All'> = ['All', 'High', 'Medium', 'Low'];

  const categoryIcons: Record<Category, React.ReactNode> = {
    Structural: <Building2 className="w-5 h-5" />,
    Zoning: <Shield className="w-5 h-5" />,
    Safety: <AlertTriangle className="w-5 h-5" />,
    Accessibility: <Accessibility className="w-5 h-5" />,
    Environmental: <TreePine className="w-5 h-5" />
  };

  const categoryHebrewNames: Record<Category, string> = {
    Structural: 'קונסטרוקציה',
    Zoning: 'תכנון ובניה',
    Safety: 'בטיחות',
    Accessibility: 'נגישות',
    Environmental: 'סביבה'
  };

  const getSeverityColor = (severity: Severity): string => {
    const colors = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity];
  };

  const getSeverityHebrew = (severity: Severity): string => {
    const hebrew = {
      High: 'גבוהה',
      Medium: 'בינונית',
      Low: 'נמוכה'
    };
    return hebrew[severity];
  };

  const filteredRules = useMemo(() => {
    return RULES_DATA.filter(rule => {
      const matchesSearch = searchQuery === '' ||
        rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.nameHebrew.includes(searchQuery) ||
        rule.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'All' || rule.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [searchQuery, selectedCategory, selectedSeverity]);

  const stats = useMemo(() => {
    const total = RULES_DATA.length;
    const high = RULES_DATA.filter(r => r.severity === 'High').length;
    const medium = RULES_DATA.filter(r => r.severity === 'Medium').length;
    const low = RULES_DATA.filter(r => r.severity === 'Low').length;
    return { total, high, medium, low };
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSeverity('All');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">תקנות ותקנים</h1>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors print:hidden"
              aria-label="הדפס דף"
            >
              <Printer className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">הדפס</span>
            </button>
          </div>
          <p className="text-gray-600 text-lg">
            מאגר מקיף של תקנות הבניה והתכנון הישראליות - {RULES_DATA.length} תקנות
          </p>
        </header>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">סך התקנות</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">חומרה גבוהה</h3>
            <p className="text-3xl font-bold text-red-700">{stats.high}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <Info className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">חומרה בינונית</h3>
            <p className="text-3xl font-bold text-yellow-700">{stats.medium}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">חומרה נמוכה</h3>
            <p className="text-3xl font-bold text-green-700">{stats.low}</p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                חיפוש
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש לפי מזהה תקנה או שם..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה
              </label>
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'הכל' : categoryHebrewNames[cat as Category]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                חומרה
              </label>
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="severity"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'All')}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  {severities.map(sev => (
                    <option key={sev} value={sev}>
                      {sev === 'All' ? 'הכל' : getSeverityHebrew(sev as Severity)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategory !== 'All' || selectedSeverity !== 'All') && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                נמצאו {filteredRules.length} תקנות
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                נקה סינונים
              </button>
            </div>
          )}
        </section>

        {/* Rules Table */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    מזהה תקנה
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    שם התקנה
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    קטגוריה
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    חומרה
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider print:hidden">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 text-lg">לא נמצאו תקנות התואמות את הסינון</p>
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          נקה סינונים
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <React.Fragment key={rule.id}>
                      <tr
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-blue-600">{rule.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{rule.nameHebrew}</div>
                          <div className="text-xs text-gray-500 mt-1">{rule.nameEnglish}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{categoryIcons[rule.category]}</span>
                            <span className="text-sm text-gray-700">{categoryHebrewNames[rule.category]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(rule.severity)}`}>
                            {getSeverityHebrew(rule.severity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap print:hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                            aria-label={expandedRuleId === rule.id ? 'סגור פרטים' : 'הצג פרטים'}
                          >
                            {expandedRuleId === rule.id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                <span>סגור</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span>פרטים</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedRuleId === rule.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-6 bg-gray-50">
                            <div className="space-y-6">
                              {/* Description */}
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <Info className="w-5 h-5 text-blue-600" />
                                  תיאור מלא
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-gray-800 mb-3 leading-relaxed">{rule.descriptionHebrew}</p>
                                  <p className="text-gray-600 text-sm italic leading-relaxed">{rule.descriptionEnglish}</p>
                                </div>
                              </div>

                              {/* References */}
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <BookOpen className="w-5 h-5 text-purple-600" />
                                  מקורות ותקנים
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <ul className="space-y-2">
                                    {rule.references.map((ref, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <ExternalLink className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                        <a
                                          href={ref.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                        >
                                          {ref.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Examples */}
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                                  דוגמאות
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {rule.examples.map((example, idx) => (
                                    <div key={idx} className="space-y-3">
                                      {/* Violation */}
                                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <div className="flex items-start gap-2 mb-2">
                                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                          <h5 className="font-semibold text-red-900">הפרה</h5>
                                        </div>
                                        <p className="text-red-800 text-sm">{example.violation}</p>
                                      </div>

                                      {/* Compliance */}
                                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-start gap-2 mb-2">
                                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                          <h5 className="font-semibold text-green-900">עמידה בתקן</h5>
                                        </div>
                                        <p className="text-green-800 text-sm">{example.compliance}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Compliance Steps */}
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  צעדים לעמידה בתקן
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <ol className="space-y-3">
                                    {rule.complianceSteps.map((step, idx) => (
                                      <li key={idx} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                          {idx + 1}
                                        </span>
                                        <span className="text-gray-800 mt-0.5">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer Info */}
        <footer className="mt-8 text-center text-sm text-gray-600 print:mt-4">
          <p>מערכת ניהול היתרי בניה | כל התקנות מבוססות על חוקי התכנון והבניה הישראליים</p>
          <p className="mt-1">עדכון אחרון: נובמבר 2025</p>
        </footer>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .print\\:mt-4 {
            margin-top: 1rem;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
};

export default RulesPage;
