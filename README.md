# Telemedicine Nabha App

A comprehensive telemedicine platform designed for rural healthcare delivery with offline support and low-bandwidth optimization.

## Project Structure

```
sih_medical/
├── backend/          # Node.js + TypeScript + Express + PostgreSQL
├── frontend/         # React PWA + Tailwind + IndexedDB
├── mobile/           # React Native + Expo
├── docker-compose.yml
└── README.md
```

## Features

- OTP-based phone authentication
- Video/audio/text consultations
- Offline-first patient records
- Digital prescriptions
- Pharmacy medicine availability
- AI-powered symptom checker
- Multi-language support (English, Hindi, Punjabi)
- Low bandwidth optimization

## Quick Start

1. Clone the repository
2. Run `docker-compose up` for development environment
3. Backend API: `http://localhost:3000`
4. Frontend PWA: `http://localhost:3001`

## Development

Each module has its own README with specific setup instructions:
- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)
- [Mobile Setup](./mobile/README.md)

## Security & Compliance

- JWT authentication with role-based access
- Encrypted health data storage
- Audit logs for all medical data access
- HIPAA compliance considerations

## Deployment

- Docker containers for production
- GitHub Actions CI/CD pipeline
- Scalable microservices architecture
