# Building Permit Platform

An AI-powered platform for automated building permit compliance checking and document processing.

## Overview

The Building Permit Platform streamlines the building permit application process by automatically analyzing architectural drawings, construction documents, and permit applications against municipal building codes and regulations. The platform uses AI and machine learning to extract information from documents, validate compliance, and provide detailed reports to both applicants and municipal officials.

## Features

- **Automated Document Processing**: Extract and analyze information from PDFs, images, and CAD files
- **Compliance Checking**: Validate building plans against municipal codes and regulations
- **Multi-language Support**: Hebrew and English interface with RTL support
- **Real-time Analytics**: Track application status and processing metrics
- **Role-based Access Control**: Separate interfaces for citizens, architects, and municipal officials
- **Document Management**: Version control and document history tracking
- **Notification System**: Email and in-app notifications for application updates

## Architecture

The platform consists of three main services:

- **Frontend**: React-based web application with TypeScript and TailwindCSS
- **Backend**: Node.js/Express API server with PostgreSQL database
- **AI Service**: Python FastAPI service for document processing and compliance checking

## Prerequisites

- **Docker** and **Docker Compose** (recommended)
- OR manually install:
  - Node.js 18+
  - Python 3.11+
  - PostgreSQL 16+
  - Redis 7+

## Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd building-permit-platform
```

2. Copy the environment file and configure:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start all services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- API Documentation: http://localhost:5000/api-docs

5. Stop all services:
```bash
docker-compose down
```

## Manual Installation

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start service
uvicorn app.main:app --reload --port 8000
```

### Database Setup

```bash
# Create PostgreSQL database
createdb building_permit

# Run migrations
cd backend
npm run migrate

# Optional: Seed with sample data
npm run seed
```

## Development

### Running Tests

**Frontend:**
```bash
cd frontend
npm test
npm run test:coverage
```

**Backend:**
```bash
cd backend
npm test
npm run test:integration
```

**AI Service:**
```bash
cd ai-service
pytest
pytest --cov=app
```

### Code Quality

**Frontend & Backend:**
```bash
npm run lint
npm run format
```

**AI Service:**
```bash
black .
flake8 .
mypy .
```

## Environment Variables

See `.env.example` for all available configuration options. Key variables:

- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `AI_SERVICE_URL`: AI service endpoint

## Project Structure

```
building-permit-platform/
├── frontend/               # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/               # Node.js backend API
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── ai-service/            # Python AI service
│   ├── app/
│   ├── models/
│   ├── rules/
│   └── requirements.txt
├── scripts/               # Utility scripts
├── docker-compose.yml     # Docker composition
└── .env.example          # Environment variables template
```

## API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: http://localhost:5000/api-docs
- OpenAPI JSON: http://localhost:5000/api-docs.json

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@buildingpermit.com
- Documentation: https://docs.buildingpermit.com

## Acknowledgments

- Built with React, Express, and FastAPI
- UI components styled with TailwindCSS
- Document processing powered by pdfplumber and PyMuPDF
- Compliance rules based on Israeli building codes
