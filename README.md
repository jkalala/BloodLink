# BloodLink - Emergency Blood Donation Platform for Angola

BloodLink is a real-time blood donation coordination platform designed specifically for Angola, combining offline-first mobile apps with hospital dashboards to connect donors during emergencies.

## Features

- 📱 **Cross-platform mobile app** (Android/iOS) with offline support
- 🏥 **Hospital dashboard** for emergency blood requests
- 📍 **Geolocation-based donor matching**
- 📲 **SMS notifications** via AfricasTalking
- 🌐 **Offline-first architecture** for rural areas
- 🔒 **ANPD-compliant** data handling
- 🌍 **Localization** in Portuguese and Umbundu

## Tech Stack

- **Frontend**: React Native (Expo), TypeScript, TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **SMS Gateway**: AfricasTalking API
- **Maps**: OpenStreetMap + React Native Maps
- **Analytics**: Firebase Analytics
- **DevOps**: GitHub Actions, Firebase CLI

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- AfricasTalking account
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bloodlink.git
   cd bloodlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Firebase and AfricasTalking credentials.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS (macOS only)
   - Scan QR code with Expo Go app

## Project Structure

```
bloodlink/
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   ├── config/          # App configuration
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   ├── services/        # API and external services
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── .env.example         # Example environment variables
├── App.tsx             # Root component
├── babel.config.js     # Babel configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use functional components with hooks
   - Implement proper error handling
   - Write unit tests for critical functions

2. **Git Workflow**
   - Create feature branches from `develop`
   - Use conventional commits
   - Submit PRs for review
   - Ensure CI passes before merging

3. **Offline Support**
   - Cache critical data using AsyncStorage
   - Implement proper sync strategies
   - Handle network state changes
   - Test offline scenarios

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests (coming soon)
npm run e2e
```

## Deployment

1. **Firebase Setup**
   ```bash
   firebase login
   firebase init
   ```

2. **Build for Production**
   ```bash
   # Android
   expo build:android

   # iOS
   expo build:ios
   ```

3. **Deploy Backend**
   ```bash
   firebase deploy
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bloodlink.ao or join our Slack channel.

## Acknowledgments

- Ministry of Health of Angola
- Hospital Geral de Luanda
- Unitel and Movicel
- OpenStreetMap contributors 