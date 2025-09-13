# Mobile App - Telemedicine Nabha

React Native mobile application built with Expo for the Telemedicine Nabha platform.

## Features

- **Cross-platform**: iOS and Android support via React Native
- **Offline Support**: Works without internet connectivity
- **Video Consultations**: Real-time video/audio calls with doctors
- **Health Records**: Secure storage of medical data
- **OTP Authentication**: Phone-based login system
- **Multi-language**: English, Hindi, Punjabi support
- **Low Bandwidth**: Optimized for rural network conditions

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Query + Context API
- **Storage**: Expo SecureStore + SQLite
- **Media**: Expo AV for video/audio
- **Offline**: Background sync capabilities

## Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
   ```bash
   # Android
   npm run android
   
   # iOS (macOS only)
   npm run ios
   
   # Web
   npm run web
   ```

## Project Structure

```
mobile/
├── src/
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── services/        # API and data services
│   ├── utils/          # Helper functions
│   ├── contexts/       # React contexts
│   └── types/          # TypeScript types
├── assets/             # Images, icons, fonts
└── app.json           # Expo configuration
```

## Key Screens

- **Login**: OTP-based authentication
- **Dashboard**: Quick access to all features
- **Consultation**: Video/audio call interface
- **Health Records**: Medical history and documents
- **Pharmacy**: Medicine availability checker
- **Symptom Checker**: AI-powered triage system
- **Profile**: User profile and settings

## Offline Features

- **Data Sync**: Automatic sync when online
- **Cached Content**: Essential data stored locally
- **Queue System**: Actions queued when offline
- **Smart Fallbacks**: Audio-only when video fails

## Build for Production

1. **Configure app.json**:
   ```json
   {
     "expo": {
       "name": "Telemedicine Nabha",
       "slug": "telemedicine-nabha",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       }
     }
   }
   ```

2. **Build for stores**:
   ```bash
   # Android APK
   expo build:android
   
   # iOS IPA
   expo build:ios
   ```

## Environment Variables

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENV=development
```

## Features Implementation

### Video Consultation
- WebRTC integration for peer-to-peer calls
- Screen sharing capabilities
- Chat during consultation
- Recording for medical records

### Offline Support
- SQLite for local data storage
- Background sync when connectivity restored
- Conflict resolution for data synchronization
- Essential features work offline

### Security
- Biometric authentication support
- Secure storage for sensitive data
- Certificate pinning for API calls
- Data encryption at rest

### Accessibility
- Screen reader support
- High contrast mode
- Large text support
- Voice navigation

## Development

```bash
# Start development server
npm run start

# Clear cache
npm run clear

# Type checking
npm run type-check

# Linting
npm run lint
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

The app supports multiple deployment strategies:

1. **Expo Go**: For development and testing
2. **Standalone Builds**: For app stores
3. **OTA Updates**: For quick updates without store approval

## Contributing

1. Follow React Native best practices
2. Use TypeScript for type safety
3. Follow the established folder structure
4. Add tests for new features
5. Update documentation
