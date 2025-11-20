# Cash Flow Tracker

A modern React Native mobile application built with Expo for tracking money owed to and from specific individuals. Keep track of loans, debts, and financial transactions with ease using a clean, intuitive interface with dark mode support.

## Features

### Dashboard
- **Real-time Balance Overview**: View your total balance, total incoming (money owed to you), and total outgoing (money you owe) at a glance
- **People Management**: Track individual balances for each person you have financial transactions with
- **Quick Add**: Easily add new people with the tap of a button
- **Pull to Refresh**: Update your data with a simple pull-down gesture

### Transaction History
- **Complete Transaction Log**: View all transactions in chronological order
- **Smart Search**: Search transactions by description, category, or person name
- **Quick Add Transaction**: Create new transactions directly from the history screen
- **Transaction Details**: Each transaction includes amount, type (incoming/outgoing), description, category, date, and associated person

### Data Management
- **CSV Export**: Export all people and transactions to a CSV file for backup or external use
- **CSV Import**: Import people and transactions from a CSV file
- **Database Reset**: Clear all data when needed (with confirmation prompt)

### User Experience
- **Dark Mode Support**: Automatically adapts to your device's color scheme preference
- **Glassmorphic Design**: Beautiful glass-effect UI components for a modern look
- **Smooth Navigation**: Bottom tab navigation for easy access to all features
- **Responsive Interface**: Optimized for various screen sizes

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Database**: SQLite (expo-sqlite)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Expo Vector Icons (Ionicons)
- **UI Effects**: Expo Blur, Linear Gradient
- **File Management**: Expo File System, Document Picker, Sharing

## Database Schema

### People Table
```sql
- id: INTEGER (Primary Key)
- name: TEXT (Required)
- email: TEXT (Optional)
- createdAt: TEXT (ISO timestamp)
```

### Transactions Table
```sql
- id: INTEGER (Primary Key)
- personId: INTEGER (Foreign Key to People)
- amount: REAL (Required)
- type: TEXT ('incoming' or 'outgoing')
- description: TEXT (Required)
- category: TEXT (Optional)
- date: TEXT (ISO date)
- createdAt: TEXT (ISO timestamp)
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cash-flow-native
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

### Running the App

After starting the development server, you have several options:

- **Development Build**: Scan the QR code with the Expo Go app
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web Browser**: Press `w` in the terminal

## Project Structure

```
cash-flow-native/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── index.tsx      # Dashboard screen
│   │   ├── history.tsx    # Transaction history
│   │   └── settings.tsx   # Settings & data management
│   ├── add-transaction.tsx
│   ├── add-person.tsx
│   └── person/[id].tsx    # Person detail view
├── components/            # Reusable UI components
│   ├── GlassCard.tsx     # Glassmorphic card component
│   ├── FlowCard.tsx      # Income/expense display card
│   ├── TransactionList.tsx
│   └── PersonCard.tsx
├── database/             # SQLite database services
│   ├── init.ts          # Database initialization
│   ├── transactionsService.ts
│   └── peopleService.ts
├── types/               # TypeScript type definitions
│   └── database.ts
├── constants/           # App constants and themes
├── hooks/              # Custom React hooks
└── assets/            # Images, fonts, and other assets
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## Key Features Explained

### Transaction Types
- **Incoming**: Money that others owe you (displayed in green)
- **Outgoing**: Money that you owe others (displayed in red)

### Balance Calculation
- Total Balance = Total Incoming - Total Outgoing
- Individual balances are calculated per person based on their transactions

### Data Export Format
The CSV export includes two sections:
1. **People Section**: ID, Name, Email, Created At
2. **Transactions Section**: ID, Person ID, Person Name, Amount, Type, Description, Category, Date, Created At

### Dark Mode
The app automatically detects your device's color scheme preference and applies the appropriate theme. All screens and components support both light and dark modes.

## Development

### Adding New Features
1. Database changes should be made in `database/init.ts`
2. Add new screens in the `app/` directory
3. Create reusable components in `components/`
4. Define types in `types/database.ts`

### Database Migrations
Currently, the app uses a simple database initialization. For production use, consider implementing proper migration strategies.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Version

Current Version: **1.0.0**

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

Built with React Native and Expo
