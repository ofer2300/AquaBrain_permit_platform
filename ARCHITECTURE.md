# Building Permit eCheck Platform - Architecture

## 🎯 סקירה כללית
פלטפורמה מתחרה ל-Archistar eCheck - מערכת AI לאישור היתרי בניה בישראל.

## 🏗️ ארכיטקטורת המערכת

### רכיבים עיקריים

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - RegisterPage, LoginPage, Dashboard                       │
│  - ProjectsPage, ProjectDetailPage                          │
│  - SubmissionDetailPage, RulesPage                          │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  - Authentication (JWT)                                      │
│  - Projects Management                                       │
│  - Submissions Management                                    │
│  - File Upload/Storage                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP API
┌────────────────────▼────────────────────────────────────────┐
│                  AI Service (Python/FastAPI)                 │
│  - PDF Processing (pdfplumber, PyMuPDF)                     │
│  - ML Models (scikit-learn, PyTorch)                        │
│  - Rules Engine (20+ Israeli building codes)                │
│  - Dimension Extraction & Validation                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Data Layer                                 │
│  - PostgreSQL (Projects, Users, Submissions)                 │
│  - Redis (Caching, Queue)                                    │
│  - MinIO/S3 (File Storage)                                   │
└──────────────────────────────────────────────────────────────┘
```

## 📂 מבנה תיקיות

```
building-permit-platform/
├── frontend/                 # React TypeScript
│   ├── src/
│   │   ├── pages/
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   ├── SubmissionDetailPage.tsx
│   │   │   └── RulesPage.tsx
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js/Express TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── submission.controller.ts
│   │   │   └── file.controller.ts
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── __tests__/
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/              # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── pdf_processor.py
│   │   ├── rules_engine.py
│   │   ├── analysis_service.py
│   │   └── models/
│   ├── rules/
│   │   └── rules.json       # 20+ Israeli building rules
│   ├── tests/
│   │   ├── test_pdf_processor.py
│   │   └── test_rules_engine.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔌 APIs

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - רישום משתמש חדש
- `POST /api/auth/login` - התחברות
- `GET /api/auth/me` - פרטי משתמש מחובר

#### Projects
- `GET /api/projects` - רשימת פרויקטים (pagination, filters)
- `POST /api/projects` - יצירת פרויקט חדש
- `GET /api/projects/:id` - פרטי פרויקט
- `PUT /api/projects/:id` - עדכון פרויקט
- `DELETE /api/projects/:id` - מחיקת פרויקט

#### Submissions
- `POST /api/projects/:id/submissions` - הגשה חדשה
- `GET /api/submissions/:id` - פרטי הגשה
- `GET /api/submissions/:id/results` - תוצאות AI

#### Files
- `POST /api/files/upload` - העלאת קובץ
- `GET /api/files/:id` - הורדת קובץ

### AI Service API Endpoints

- `POST /analyze` - ניתוח מסמך מלא
- `POST /classify` - סיווג מסמך
- `POST /extract-dimensions` - חילוץ מידות
- `POST /validate-rules` - בדיקת כללי בניה
- `GET /rules` - רשימת כללים זמינים

## 🎨 Frontend Pages - דרישות מלאות

### 1. RegisterPage.tsx ✅
- טופס הרשמה: שם, אימייל, סיסמה, אישור סיסמה
- ולידציות
- RTL Support
- הצלחה → ניווט ל-Dashboard

### 2. DashboardPage.tsx
**סטטיסטיקות:**
- מספר פרויקטים
- מספר הגשות
- Pass Rate
- Fail Rate

**גרפים (Recharts):**
- Bar Chart: הגשות לפי חודש
- Pie Chart: Pass vs Fail
- Line Chart: טרנד לאורך זמן

**טבלאות:**
- 5 פרויקטים אחרונים + קישורים
- 5 הגשות אחרונות + קישורים

### 3. ProjectsPage.tsx
- טבלה מלאה: שם, עיר, כתובת, סטטוס, תאריך
- חיפוש (שם/עיר)
- סינון (סטטוס)
- Pagination (10/page)
- כפתור "פרויקט חדש"

### 4. ProjectDetailPage.tsx
- פרטי פרויקט מלאים
- רשימת הגשות (טבלה)
- כפתור "הגשה חדשה"
- Timeline אירועים
- סטטוס נוכחי

### 5. SubmissionDetailPage.tsx
- פרטי הגשה
- רשימת קבצים שהועלו
- תוצאות AI (Pass/Fail)
- רשימת Violations:
  - Rule ID
  - שם כלל
  - חומרה (High/Medium/Low)
  - תיאור
  - המלצה לתיקון
- כפתור יצוא PDF

### 6. RulesPage.tsx
- טבלה של כל הכללים (≥20)
- עמודות: ID, שם, קטגוריה, חומרה
- חיפוש
- סינון לפי קטגוריה
- לחיצה על כלל → פרטים מלאים + קישור לתקנה

## 🤖 AI Service - דרישות מלאות

### Rules Engine (rules_engine.py)

**20 כללי בניה ישראליים - חלוקה לקטגוריות:**

#### Structural (5 כללים)
1. STR-LOAD-001: בדיקת עומסי תכן
2. STR-FOUND-002: עומק יסודות
3. STR-COLUMN-003: מידות עמודים מינימליות
4. STR-BEAM-004: מידות קורות
5. STR-SLAB-005: עובי תקרות

#### Zoning (5 כללים)
6. ZON-SETBACK-001: מרחקי בניין מגבול מגרש
7. ZON-HEIGHT-002: גובה מבנה מקסימלי
8. ZON-COVERAGE-003: אחוז בניה
9. ZON-FAR-004: אחוז קומות (תב"ע)
10. ZON-PARKING-005: חניות נדרשות

#### Safety (5 כללים)
11. SAF-FIRE-001: דרישות כיבוי אש
12. SAF-EVAC-002: יציאות חירום
13. SAF-STAIR-003: מידות מדרגות
14. SAF-RAIL-004: מעקות בטיחות
15. SAF-LIGHT-005: תאורת חירום

#### Accessibility (3 כללים)
16. ACC-RAMP-001: שיפוע רמפות
17. ACC-DOOR-002: רוחב דלתות נגישות
18. ACC-ELEV-003: דרישות מעלית

#### Environmental (2 כללים)
19. ENV-ENERGY-001: תקן ירוק (SI 5282)
20. ENV-NOISE-002: בידוד רעש

**מבנה כלל:**
```json
{
  "id": "ZON-SETBACK-001",
  "name_he": "מרחקי בניין מגבול מגרש",
  "name_en": "Building Setback from Property Line",
  "category": "Zoning",
  "severity": "High",
  "description_he": "בדיקת קווי בניין מינימליים לפי התקן או התב\"ע",
  "refs": [
    "תקנות התכנון והבניה (בקשה להיתר, תנאיו ואגרות), התשכ\"ח-1970",
    "תב\"ע מקומית"
  ],
  "validation_logic": "function_check_setbacks",
  "inputs": {
    "required": ["plot.boundaries", "building.footprint", "zoning.setbacks"],
    "optional": ["zoning.exemptions"]
  },
  "thresholds": {
    "front": 5.0,
    "side": 3.0,
    "rear": 4.0
  },
  "output_schema": {
    "passed": "boolean",
    "violations": "array",
    "warnings": "array",
    "evidence": "object"
  }
}
```

### Analysis Service (analysis_service.py)

**פונקציות נדרשות:**

1. **load_models()**
   - טעינת מודל ML (scikit-learn/PyTorch)
   - או integration עם API חיצוני
   - Error handling

2. **classify_document(pdf_path)**
   - זיהוי סוג מסמך:
     - תב"ע (Zoning Plan)
     - תכנית מדידה (Survey)
     - גרמושקה (Accordion)
     - חתך (Section)
     - חזית (Elevation)
   - Confidence score

3. **extract_dimensions(pdf_path)**
   - שימוש ב-pdfplumber או PyMuPDF
   - חילוץ טקסט + מטא-דאטה
   - זיהוי מידות (regex patterns)
   - OCR אם נדרש (Tesseract)

4. **detect_violations(data, rules)**
   - קריאה ל-Rules Engine
   - מיזוג תוצאות
   - סיווג חומרה
   - יצירת דוח מפורט

## 🧪 Testing Requirements

### Backend Tests
- **auth.test.ts**: רישום, התחברות, JWT validation
- **project.test.ts**: CRUD operations, pagination
- **file.test.ts**: upload, download, validation

### Frontend Tests
- **HomePage.test.tsx**: rendering, navigation
- **LoginPage.test.tsx**: form validation, submission
- **Dashboard.test.tsx**: data display, charts

### AI Service Tests
- **test_pdf_processor.py**: PDF parsing, text extraction
- **test_rules_engine.py**: rule validation, each category

## 🐳 Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/permits
      - REDIS_URL=redis://redis:6379
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - db
      - redis
      - ai-service

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/models
    volumes:
      - ./models:/models

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=permits
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🔐 Environment Variables

**.env.example:**
```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/permits
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000

# Frontend
REACT_APP_API_URL=http://localhost:4000/api

# AI Service
MODEL_PATH=./models
RULES_PATH=./rules/rules.json
```

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'engineer' | 'client';
  createdAt: Date;
}
```

### Project
```typescript
interface Project {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### Submission
```typescript
interface Submission {
  id: string;
  projectId: string;
  files: File[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: AnalysisResult;
  createdAt: Date;
}
```

### AnalysisResult
```typescript
interface AnalysisResult {
  passed: boolean;
  violations: Violation[];
  warnings: Warning[];
  score: number;
  processedAt: Date;
}
```

### Violation
```typescript
interface Violation {
  ruleId: string;
  ruleName: string;
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  evidence?: any;
}
```

## ✅ Definition of Done

- ✅ 0 TODO בקוד
- ✅ 6 דפי frontend מלאים ופועלים
- ✅ כל Controllers/Services ללא TODO
- ✅ כל הבדיקות עוברות (Backend + Frontend + AI)
- ✅ docker-compose up פועל ללא שגיאות
- ✅ Rules Engine עם ≥20 כללים ישראליים
- ✅ ML models אמיתיים או functional implementation
- ✅ אינטגרציה מלאה בין שירותים
- ✅ RTL Support בעברית
- ✅ Error handling מלא
- ✅ Logging ותיעוד
- ✅ .env.example מלא
- ✅ README עם הוראות הרצה

## 🎯 Success Metrics

- **Functionality**: כל הפיצ'רים עובדים
- **Quality**: TypeScript/Python נקי, lint עובר
- **Testing**: כל הבדיקות עוברות
- **Documentation**: תיעוד מלא
- **Deployment**: Docker Compose עולה בהצלחה

**ציון יעד: 10/10**
