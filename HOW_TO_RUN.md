# 🚀 How to Run Telemedicine Nabha App

## Quick Development Setup (Without Docker/PostgreSQL)

### Step 1: Install Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **Git**: Download from [git-scm.com](https://git-scm.com/)

### Step 2: Backend Setup (Using SQLite for development)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

The backend will run on: **http://localhost:3000**

### Step 3: Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on: **http://localhost:3001**

### Step 4: Mobile Setup (Optional)

```bash
# Open new terminal and navigate to mobile
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

## Testing the Application

1. **Backend Health Check**: Visit http://localhost:3000/health
2. **Frontend**: Visit http://localhost:3001
3. **API Endpoints**: Test http://localhost:3000/api/auth/send-otp

## Default Test Credentials

- **Phone**: +91 9876543210
- **OTP**: 123456 (in development mode)

## Common Issues & Solutions

### Backend Issues
- **Port 3000 in use**: Change PORT in .env file
- **Database errors**: Delete database.db and run migrations again
- **Prisma errors**: Run `npx prisma generate`

### Frontend Issues
- **Port 3001 in use**: React will suggest alternative port
- **API connection**: Check REACT_APP_API_URL in .env
- **Build errors**: Delete node_modules and reinstall

### Mobile Issues
- **Expo CLI**: Install globally with `npm install -g @expo/cli`
- **Metro bundler**: Clear cache with `npm start -- --clear`

## Production Deployment

For production deployment:

1. **Database**: Use PostgreSQL instead of SQLite
2. **Environment**: Update .env files with production values
3. **Docker**: Use docker-compose.yml for containerized deployment
4. **Security**: Change JWT_SECRET and other secrets

## File Structure
```
sih_medical/
├── backend/     # Node.js API server (Port 3000)
├── frontend/    # React web app (Port 3001)
├── mobile/      # React Native app (Expo)
└── README.md    # This file
```

## Next Steps

1. Start backend server
2. Start frontend server  
3. Open http://localhost:3001 in browser
4. Test OTP login functionality
5. Explore dashboard and features
