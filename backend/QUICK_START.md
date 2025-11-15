# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd C:/Users/USER/AQ/building-permit-platform/backend
npm install
```

### 2. Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your JWT secret
# Minimum requirement:
# JWT_SECRET=your-secret-key-here
```

### 3. Run Tests to Verify
```bash
npm test
```

**Expected output:**
```
Test Suites: 3 passed, 3 total
Tests:       99 passed, 99 total
```

## Start the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

The server will start on `http://localhost:4000`

### Production Mode
```bash
npm run build
npm start
```

## Test the API

### Register a User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "homeowner"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "homeowner"
  }
}
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Create a Project (with auth token)
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Kitchen Renovation",
    "description": "Complete kitchen remodel",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  }'
```

### Get All Projects
```bash
curl -X GET "http://localhost:4000/api/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Upload a File
```bash
curl -X POST http://localhost:4000/api/projects/proj-123/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf"
```

## Available Endpoints

### Authentication (no auth required)
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (auth required)

### Projects (all require auth)
- `POST /api/projects` - Create
- `GET /api/projects` - List with pagination
- `GET /api/projects/:id` - Get one
- `PUT /api/projects/:id` - Update
- `DELETE /api/projects/:id` - Delete

### Files (all require auth)
- `POST /api/projects/:projectId/files` - Upload
- `GET /api/files/:fileId` - Get metadata
- `GET /api/files/:fileId/download` - Download
- `GET /api/projects/:projectId/files` - List
- `DELETE /api/files/:fileId` - Delete

## Environment Variables

Create `.env` file:
```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
MAX_FILE_SIZE=10485760
```

## Password Requirements

Passwords must have:
- At least 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

Example valid password: `Password123!`

## Supported File Types

- PDF (`.pdf`)
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- Word (`.docx`)
- Excel (`.xlsx`)

Max file size: 10MB

## User Roles

- `homeowner` - Property owners
- `contractor` - Construction contractors
- `admin` - System administrators
- `reviewer` - Permit reviewers

## Authorization Rules

### Projects
- Create: Any authenticated user
- Read: Any authenticated user
- Update: Owner or admin only
- Delete: Owner or admin only

### Files
- Upload: Project owner or admin only
- Download: Any authenticated user
- Delete: File uploader, project owner, or admin

## Common Issues

### "No token provided" error
Make sure you include the Authorization header:
```
Authorization: Bearer your-token-here
```

### "Invalid credentials" error
- Check email and password are correct
- Password is case-sensitive
- Email must be exact match

### "File too large" error
- Max file size is 10MB
- Check your file size
- Adjust MAX_FILE_SIZE in .env if needed

### "Invalid file type" error
Only these types are allowed:
- application/pdf
- image/jpeg
- image/png
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── models/           # Data models
│   ├── middleware/       # Auth, etc.
│   ├── services/         # Utilities
│   └── server.ts         # Entry point
├── package.json
├── .env                  # Your config (create this)
└── README.md
```

## Development Tips

### Watch mode for tests
```bash
npm run test:watch
```

### Check types without running
```bash
npm run type-check
```

### Format code
```bash
npm run format
```

### Lint code
```bash
npm run lint
npm run lint:fix
```

## What's Next?

1. ✅ Backend is ready - all tests passing
2. 🔄 Integrate with frontend
3. 🔄 Add database (PostgreSQL)
4. 🔄 Deploy to production
5. 🔄 Add advanced features

---

**You're all set! The backend is ready to use.** 🎉
