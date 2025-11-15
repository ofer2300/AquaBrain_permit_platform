# Contributing to AquaBrain Building Permit Platform

תודה שאתה מעוניין לתרום לפלטפורמת AquaBrain! 🎉

## Code of Conduct

פרויקט זה פועל לפי [Code of Conduct](CODE_OF_CONDUCT.md). על ידי השתתפות, אתה מתחייב לשמור על סביבה מכבדת וכוללת.

## How to Contribute

### Reporting Bugs

אם מצאת באג, אנא פתח [issue](https://github.com/ofer2300/AquaBrain_permit_platform/issues) חדש עם:
- תיאור ברור של הבעיה
- צעדים לשחזור
- התנהגות צפויה מול התנהגות בפועל
- Screenshots אם רלוונטי
- סביבת העבודה (OS, דפדפן, גרסה)

### Suggesting Features

רעיונות חדשים תמיד מבורכים! פתח issue עם:
- תיאור מפורט של הפיצ'ר המוצע
- מדוע זה יהיה שימושי
- דוגמאות לשימוש
- אפשרויות יישום

### Pull Requests

1. **Fork** את ה-repository
2. **Create a branch** מ-development:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - עקוב אחר style guide
   - הוסף tests למאפיינים חדשים
   - עדכן documentation
   - ודא ש-all tests עוברים

4. **Commit** עם הודעות ברורות:
   ```bash
   git commit -m "feat: add new feature

   - Detailed description of what changed
   - Why the change was necessary
   - Any breaking changes"
   ```

5. **Push** ל-fork שלך:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** אל development branch

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- PostgreSQL 14+ (אופציונלי למפתחים)

### Setup
```bash
# Clone the repository
git clone https://github.com/ofer2300/AquaBrain_permit_platform.git
cd AquaBrain_permit_platform

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && pip install -r requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
# Edit .env files with your configuration

# Run tests
cd frontend && npm test
cd ../backend && npm test
cd ../ai-service && pytest
```

## Code Style

### TypeScript/JavaScript
- משתמשים ב-ESLint + Prettier
- רץ `npm run lint` ו-`npm run format` לפני commit
- משתמשים ב-TypeScript strict mode
- קוד מתועד עם JSDoc/TSDoc

### Python
- עוקבים אחר PEP 8
- משתמשים ב-Black formatter
- Type hints לכל הפונקציות
- Docstrings ב-Google style

### Git Commits
משתמשים ב-[Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - מאפיין חדש
- `fix:` - תיקון באג
- `docs:` - שינויים בתיעוד
- `style:` - שינויי עיצוב (לא משפיע על לוגיקה)
- `refactor:` - שינוי קוד שלא מוסיף מאפיין או מתקן באג
- `test:` - הוספה או תיקון של tests
- `chore:` - שינויי תחזוקה

## Testing

### Frontend
```bash
cd frontend
npm test                    # Run all tests
npm test -- HomePage.test.tsx  # Run specific test
npm run test:coverage      # Generate coverage report
```

### Backend
```bash
cd backend
npm test                   # Run all tests
npm test -- auth.test.ts  # Run specific test
npm run test:watch        # Watch mode
```

### AI Service
```bash
cd ai-service
pytest                    # Run all tests
pytest tests/test_analysis_service.py  # Run specific test
pytest --cov             # With coverage
```

## Documentation

- עדכן README.md אם משנים API או behavior
- הוסף JSDoc/TSDoc לפונקציות חדשות
- עדכן ARCHITECTURE.md אם משנים מבנה
- כתוב documentation לפיצ'רים חדשים

## Review Process

1. CI checks צריכים לעבור (tests, lint, build)
2. Code review מ-maintainer אחד לפחות
3. כל ה-comments צריכים להיות מטופלים
4. Branch מעודכן עם development

## Questions?

אם יש שאלות, אפשר:
- לפתוח [Discussion](https://github.com/ofer2300/AquaBrain_permit_platform/discussions)
- ליצור קשר ב-[Issues](https://github.com/ofer2300/AquaBrain_permit_platform/issues)

תודה על התרומה! 🙏
