# Building Permit Platform - Backend API

A complete Node.js/Express backend implementation with TypeScript for the AI-powered building permit compliance platform.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Project Management**: Full CRUD operations for building permit projects
- **File Management**: Upload/download files with multer (PDF, images, Office documents)
- **Role-Based Access Control**: Support for homeowner, contractor, admin, and reviewer roles
- **In-Memory Storage**: Simple in-memory data storage (no database required for testing)
- **Validation**: Email validation, password strength requirements
- **Security**: Helmet, CORS, rate limiting ready
- **TypeScript**: Full type safety

## Project Structure

```
backend/
├── src/
│   ├── __tests__/           # Test files
│   │   ├── auth.test.ts
│   │   ├── project.test.ts
│   │   └── file.test.ts
│   ├── controllers/         # Route handlers
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   └── fileController.ts
│   ├── middleware/          # Express middleware
│   │   └── auth.ts
│   ├── models/              # Data models
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── File.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   └── files.ts
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   └── storageService.ts
│   ├── test/                # Test utilities
│   │   ├── helpers.ts
│   │   └── setup.ts
│   └── server.ts            # Main server entry point
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Projects

- `POST /api/projects` - Create project (requires auth)
- `GET /api/projects` - List projects with pagination and filters (requires auth)
- `GET /api/projects/:id` - Get project by ID (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth, owner or admin only)
- `DELETE /api/projects/:id` - Delete project (requires auth, owner or admin only)

### Files

- `POST /api/projects/:projectId/files` - Upload file (requires auth, owner or admin only)
- `GET /api/files/:fileId` - Get file metadata (requires auth)
- `GET /api/files/:fileId/download` - Download file (requires auth)
- `GET /api/projects/:projectId/files` - List project files (requires auth)
- `DELETE /api/files/:fileId` - Delete file (requires auth, uploader/owner/admin only)

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set JWT_SECRET
# JWT_SECRET=your-secret-key-here
```

## Running the Server

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## Environment Variables

```env
PORT=4000                    # Server port
NODE_ENV=development         # Environment (development/production/test)
JWT_SECRET=your-secret-key   # JWT signing secret
MAX_FILE_SIZE=10485760       # Max file upload size (10MB)
```

## Authentication

### Registration

Requires:
- `name` (string)
- `email` (valid email format)
- `password` (min 8 chars, uppercase, lowercase, number, special character)
- `role` ('homeowner' | 'contractor' | 'admin' | 'reviewer')

Returns JWT token and user object (without password).

### Login

Requires:
- `email`
- `password`

Returns JWT token and user object (without password).

### Protected Routes

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Project Management

### Create Project

```json
{
  "title": "Kitchen Renovation",
  "description": "Complete kitchen remodel",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701"
}
```

### Pagination & Filtering

Query parameters:
- `page` (default: 1)
- `limit` (default: 10)
- `status` (draft, submitted, under_review, approved, rejected)
- `city` (case-insensitive)

Example: `GET /api/projects?page=1&limit=20&status=draft&city=Springfield`

## File Upload

### Supported File Types

- PDF (`application/pdf`)
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- XLSX (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

### File Size Limit

Default: 10MB (configurable via `MAX_FILE_SIZE` env var)

### Upload Example

```bash
curl -X POST \
  http://localhost:4000/api/projects/proj-123/files \
  -H 'Authorization: Bearer <token>' \
  -F 'file=@document.pdf'
```

## Authorization Rules

### Projects
- **Create**: Any authenticated user
- **Read**: Any authenticated user
- **Update**: Project owner or admin only
- **Delete**: Project owner or admin only

### Files
- **Upload**: Project owner or admin only
- **Read/Download**: Any authenticated user
- **Delete**: File uploader, project owner, or admin only

## Testing

The backend includes comprehensive test coverage:
- 99 tests covering all API endpoints
- Authentication tests (JWT, password hashing)
- Project CRUD tests
- File upload/download tests
- Authorization tests
- Integration tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm test auth.test.ts

# Watch mode
npm run test:watch
```

## Data Models

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'homeowner' | 'contractor' | 'admin' | 'reviewer';
  createdAt: Date;
}
```

### Project
```typescript
{
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### File
```typescript
{
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  projectId: string;
  uploadedBy: string;
  path: string;
  createdAt: Date;
}
```

## Error Responses

All errors follow consistent format:

```json
{
  "error": "Error message here"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `413` - Payload Too Large
- `500` - Internal Server Error

## Security Features

- JWT token authentication (24-hour expiration)
- Password hashing with bcrypt (10 salt rounds)
- Email validation
- Password strength requirements
- Helmet security headers
- CORS enabled
- File type validation
- File size limits
- Role-based access control

## Future Enhancements

- Database integration (PostgreSQL)
- Redis caching
- Rate limiting per user/IP
- Email notifications
- File storage (S3, etc.)
- Audit logging
- Advanced search/filtering
- Real-time updates (WebSockets)
- Document generation (PDF reports)

## License

MIT
