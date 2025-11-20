# Cash Flow Tracker

A React Native mobile app for tracking money owed to and from individuals. Built with Expo and TypeScript.

## Features

- **Dashboard**: View total balance, incoming/outgoing amounts, and people list
- **Transaction Management**: Add transactions with amount, type (incoming/outgoing), description, category, and date
- **Person Profiles**: Track individual balances, view transaction history, delete with cascade
- **Search**: Filter transactions by description, category, or person name
- **Data Export/Import**: CSV format for backup and restore
- **Dark Mode**: Automatic theme switching based on device settings

## Tech Stack

- React Native 0.81.5 with Expo SDK 54
- TypeScript
- SQLite database
- Expo Router (file-based navigation)
- NativeWind (Tailwind CSS)

## Getting Started

### Installation

```bash
npm install
```

### Run the App

```bash
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
app/                    # Screens (Dashboard, History, Settings)
components/             # Reusable UI components
database/               # SQLite services and schema
types/                  # TypeScript definitions
```

## Database Schema

**People Table:**
- id, name, email, createdAt

**Transactions Table:**
- id, personId, amount, type (incoming/outgoing), description, category, date, createdAt
- Foreign key with cascade delete

## Scripts

- `npm start` - Start development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run linter

## Balance Calculation

- **Incoming**: Money others owe you (green, positive)
- **Outgoing**: Money you owe others (red, negative)
- Person Balance = Incoming - Outgoing

## Version

1.0.0
