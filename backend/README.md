# Backend - Telemedicine Nabha API

REST API server for the Telemedicine Nabha application built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- **Authentication**: OTP-based phone authentication with JWT tokens
- **User Roles**: Patient, Doctor, Pharmacy, Admin
- **Real-time Consultations**: Video/Audio/Chat support
- **Health Records**: Digital patient records with offline support
- **Pharmacy Integration**: Medicine availability checking
- **Symptom Checker**: AI/rule-based triage system
- **Audit Logging**: Complete audit trail for compliance

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with OTP verification
- **SMS**: Twilio integration
- **Security**: Helmet, CORS, bcrypt

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Twilio account (for SMS OTP)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/telemedicine_nabha
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:19006
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP for phone verification
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile

### Doctors
- `GET /api/doctors` - Get available doctors
- `GET /api/doctors/:id` - Get doctor details

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Schedule new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Consultations
- `GET /api/consultations` - Get consultations
- `POST /api/consultations/:id/start` - Start consultation
- `POST /api/consultations/:id/end` - End consultation
- `POST /api/consultations/:id/messages` - Send message

### Pharmacies
- `GET /api/pharmacies` - Get nearby pharmacies
- `GET /api/pharmacies/:id/medicines` - Get pharmacy inventory
- `GET /api/pharmacies/search-medicine` - Search medicine availability

### Health Records
- `GET /api/health-records` - Get patient health records
- `POST /api/health-records` - Add new health record

### Symptom Checker
- `POST /api/symptom-check` - Analyze symptoms for triage

### Sync
- `POST /api/sync/offline-events` - Sync offline data

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: Base user authentication
- **Patient**: Patient profiles and medical history
- **Doctor**: Doctor profiles and specializations
- **Pharmacy**: Pharmacy information and inventory
- **Appointment**: Scheduled consultations
- **Consultation**: Active consultation sessions
- **Prescription**: Digital prescriptions
- **Medicine**: Pharmacy inventory
- **HealthRecord**: Patient medical records
- **AuditLog**: Security and compliance logging

## Development

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Build for production
npm run build

# Start production server
npm start
```

## Security Features

- JWT-based authentication
- OTP phone verification
- Role-based access control
- Request rate limiting
- SQL injection protection
- XSS protection via Helmet
- CORS configuration
- Audit logging for compliance

## Deployment

The application is containerized with Docker:

```bash
# Build image
docker build -t telemedicine-backend .

# Run with Docker Compose
docker-compose up
```

## Contributing

1. Follow TypeScript and ESLint rules
2. Add tests for new features
3. Update API documentation
4. Follow conventional commit messages
