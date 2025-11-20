# Cash Flow Tracker

A modern React Native mobile application built with Expo for tracking money owed to and from specific individuals. Manage loans, debts, and financial transactions with a beautiful, intuitive interface that helps you keep track of who owes you money and whom you owe.

## Features

### 📊 Dashboard
- **Real-time Financial Overview**: View your total balance at a glance with color-coded indicators
  - Green: Positive balance (others owe you)
  - Red: Negative balance (you owe others)
  - Gray: No outstanding balance
- **Total Incoming/Outgoing Summary**: Track total money owed to you vs. money you owe
- **People List with Individual Balances**: Each person shows:
  - Name and email (if provided)
  - Current balance with color coding
  - Total transaction count
  - Tap any person to view their detailed profile
- **Pull-to-Refresh**: Update all data with a simple pull-down gesture
- **Quick Add Person**: Add new people directly from the dashboard

### 💰 Transaction Management
- **Add Transactions** with comprehensive details:
  - Select person from dropdown
  - Visual transaction type toggle:
    - **Money In** (incoming): Money others owe you - displayed with green arrow-down icon
    - **Money Out** (outgoing): Money you owe others - displayed with red arrow-up icon
  - Amount with decimal support
  - Description (required)
  - Category (optional) - e.g., Loan, Payment, Gift, etc.
  - Date selection (YYYY-MM-DD format)
- **Transaction History Screen**:
  - View all transactions in chronological order
  - **Real-time Search**: Filter by description, category, or person name
  - Each transaction displays:
    - Color-coded arrow icon (green/red)
    - Description and person name
    - Date and category
    - Amount with +/- prefix
  - Quick add transaction button

### 👤 Person Details
- **Individual Person Profiles**:
  - Circular avatar with first letter of name
  - Full name and email display
  - Balance card showing:
    - Current balance with descriptive text ("Owes you $X" or "You owe $X")
    - Total transaction count
  - Complete transaction history for that person
  - Quick add transaction (pre-selects the person)
  - Delete person option with confirmation
    - **Cascade Delete**: Automatically removes all associated transactions

### 👥 People Management
- **Add New People**:
  - Name (required)
  - Email (optional)
- **View People**:
  - Alphabetically sorted list
  - Each card shows balance and transaction count
  - Click to view detailed profile
- **Delete People**: Remove people and all their transactions

### 💾 Data Management
- **CSV Export**:
  - Export all people and transactions to CSV file
  - Includes two sections: People data and Transactions data
  - Share via system share dialog or save to device
  - Timestamp included in export
- **CSV Import**:
  - Import people and transactions from CSV
  - Follows the same format as export
  - Shows confirmation with import counts
- **Database Reset**:
  - Clear all data with confirmation dialog
  - Permanent deletion warning

### 🎨 User Experience
- **Automatic Dark Mode**: Adapts to device color scheme preference
  - All screens support both light and dark themes
  - Proper contrast for readability
- **Beautiful UI Design**:
  - Glassmorphic card effects
  - Smooth shadows and borders
  - Color-coded balances throughout
  - Visual transaction type indicators
- **Smart Navigation**:
  - Tab-based navigation (Dashboard, History, Settings)
  - Modal-style add screens
  - Back navigation with proper routing
- **Responsive Interface**:
  - Keyboard-aware forms
  - Touch-friendly buttons and cards
  - Empty states with helpful messages
- **Visual Feedback**:
  - Transaction counts displayed everywhere
  - Balance summaries on all relevant screens
  - Loading states

## Tech Stack

- **Framework**: React Native 0.81.5
- **Runtime**: Expo SDK ~54.0.25
- **Language**: TypeScript ~5.9.2
- **Navigation**: Expo Router ~6.0.15 (file-based routing)
- **Database**: SQLite (expo-sqlite ~16.0.9)
- **Styling**: NativeWind 4.2.1 (Tailwind CSS for React Native)
- **UI Components**:
  - Expo Vector Icons (Ionicons)
  - React Native Picker
  - Custom glassmorphic components
- **Visual Effects**:
  - expo-blur ~15.0.7
  - expo-linear-gradient ~15.0.7
- **File Operations**:
  - expo-file-system ~19.0.19
  - expo-document-picker ~12.0.0
  - expo-sharing ~14.0.7
- **Animations**: React Native Reanimated ~4.1.1

## Database Schema

The app uses SQLite with the following schema:

### People Table
```sql
CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  personId INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('incoming', 'outgoing')),
  description TEXT NOT NULL,
  category TEXT,
  date TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people (id) ON DELETE CASCADE
);
```

### Indexes
- `idx_transactions_personId` - For fast person-based queries
- `idx_transactions_date` - For date-range queries
- `idx_transactions_type` - For filtering by transaction type

### Database Features
- **WAL Mode** (Write-Ahead Logging) enabled for better concurrency
- **Foreign Key Constraints** with cascade delete
- **Check Constraints** for transaction type validation
- **Automatic Timestamps** for audit trail

## Getting Started

### Prerequisites
- **Node.js** v18 or later
- **npm** or **yarn**
- **Expo CLI** (installed via npx)
- **Development Environment**:
  - iOS: macOS with Xcode and iOS Simulator
  - Android: Android Studio with Android Emulator
  - Physical Device: Expo Go app

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd cash-flow-native
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npx expo start
```

### Running the App

After starting the development server, you have several options:

**Mobile Devices:**
- **iOS Simulator** (macOS only): Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**:
  1. Install Expo Go app from App Store/Play Store
  2. Scan the QR code displayed in the terminal

**Web Browser:**
- Press `w` in the terminal (limited functionality)

## Project Structure

```
cash-flow-native/
├── app/                          # Application screens (Expo Router)
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── index.tsx           # Dashboard (Home screen)
│   │   ├── history.tsx         # Transaction history with search
│   │   ├── settings.tsx        # Settings and data management
│   │   └── _layout.tsx         # Tab layout configuration
│   ├── person/
│   │   └── [id].tsx           # Dynamic person detail screen
│   ├── add-transaction.tsx     # Add transaction modal
│   ├── add-person.tsx          # Add person modal
│   └── _layout.tsx             # Root layout
├── components/                  # Reusable UI components
│   ├── GlassCard.tsx          # Glassmorphic balance card
│   ├── FlowCard.tsx           # Incoming/outgoing display card
│   ├── PersonCard.tsx         # Person list item with balance
│   ├── TransactionList.tsx    # Reusable transaction list
│   └── ui/                    # Base UI components
├── database/                    # SQLite database layer
│   ├── init.ts               # Database initialization & schema
│   ├── transactionsService.ts # Transaction CRUD operations
│   └── peopleService.ts      # People CRUD operations
├── types/                      # TypeScript type definitions
│   └── database.ts            # Database entity types
├── constants/                  # App constants
│   └── theme.ts              # Theme colors and styles
├── hooks/                      # Custom React hooks
│   ├── use-color-scheme.ts   # Color scheme detection
│   └── use-theme-color.ts    # Theme color utilities
└── assets/                     # Static assets (images, fonts)
```

## Available Scripts

- **`npm start`** - Start the Expo development server
- **`npm run android`** - Launch on Android emulator/device
- **`npm run ios`** - Launch on iOS simulator/device
- **`npm run web`** - Launch in web browser
- **`npm run lint`** - Run ESLint code linting

## How It Works

### Transaction Types Explained
- **Incoming (Money In)**:
  - Money that others owe you
  - Examples: You lent money, someone owes you for shared expenses
  - Displayed with green color and down-arrow icon
  - Adds to person's balance (positive number)

- **Outgoing (Money Out)**:
  - Money that you owe others
  - Examples: You borrowed money, you owe someone for expenses they covered
  - Displayed with red color and up-arrow icon
  - Subtracts from person's balance (negative number)

### Balance Calculation
```
Person Balance = Sum of Incoming - Sum of Outgoing
Total Balance = Sum of All Incoming - Sum of All Outgoing
```

**Example:**
- You lent John $100 (Incoming) → Balance: +$100
- John paid you back $40 (Outgoing) → Balance: +$60
- Result: John owes you $60

### Person Cards Color Coding
- **Green**: Person owes you money (positive balance)
- **Red**: You owe the person money (negative balance)
- **Gray**: No outstanding balance (zero)

### CSV Export Format

The CSV export contains two sections:

**People Section:**
```
ID,Name,Email,Created At
1,"John Doe","john@example.com","2025-01-15T10:30:00.000Z"
```

**Transactions Section:**
```
ID,Person ID,Person Name,Amount,Type,Description,Category,Date,Created At
1,1,"John Doe",100.00,"incoming","Loan","Loan","2025-01-15","2025-01-15T10:30:00.000Z"
```

## Development Guide

### Adding New Features

1. **Database Changes**:
   - Update schema in `database/init.ts`
   - Add migration logic if needed
   - Update TypeScript types in `types/database.ts`

2. **New Screens**:
   - Add files in `app/` directory
   - Use Expo Router file-based routing
   - Follow naming conventions: `(tabs)` for tab screens, `[id]` for dynamic routes

3. **Reusable Components**:
   - Create in `components/` directory
   - Support dark mode via `useColorScheme` hook
   - Follow existing styling patterns

4. **Database Operations**:
   - Add service functions in `database/transactionsService.ts` or `database/peopleService.ts`
   - Use prepared statements to prevent SQL injection
   - Handle errors gracefully

### Code Style Guidelines

- Use TypeScript for type safety
- Follow React hooks best practices
- Implement dark mode support for all new components
- Use StyleSheet.create for component styles
- Handle loading and error states
- Add proper TypeScript types for all functions

### Testing Considerations

- Test on both iOS and Android
- Verify dark mode appearance
- Test with empty states (no people, no transactions)
- Verify CSV import/export functionality
- Test cascade delete behavior
- Validate form inputs

## Troubleshooting

**Database Issues:**
- If data isn't persisting, check database initialization in `database/init.ts`
- Use "Reset Database" in Settings to clear corrupt data

**Import/Export Issues:**
- Ensure CSV format matches the export format exactly
- Check file permissions for reading/writing

**Performance:**
- For large datasets, consider pagination
- SQLite indexes are already optimized for common queries

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Test on both iOS and Android
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Future Enhancement Ideas

- Transaction editing/deletion
- Date picker UI for transaction dates
- Filtering by date range
- Charts and analytics
- Multiple currencies support
- Notification reminders
- Person profile pictures
- Transaction attachments (receipts)
- Bulk operations
- Data backup to cloud

## License

This project is private and proprietary.

## Version

**Current Version:** 1.0.0

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with ❤️ using React Native and Expo**
