# Cash Flow APK Build Guide

This guide will help you build an APK file for your Cash Flow app.

## Prerequisites

1. **Node.js and npm** installed on your system
2. **Expo account** (free) - Sign up at https://expo.dev/signup
3. **EAS CLI** installed globally

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials when prompted.

## Step 3: Configure Your Project

The project is already configured with:
- `eas.json` - Build configuration
- `app.json` - App metadata and settings
- Package name: `com.xulqarnain.cashflow`

## Step 4: Build APK

### Option A: Production Build (Recommended for Release)

```bash
eas build --platform android --profile production
```

This creates an optimized, production-ready APK.

### Option B: Preview Build (For Testing)

```bash
eas build --platform android --profile preview
```

This is faster and good for testing before final release.

### Option C: Development Build

```bash
eas build --platform android --profile development
```

This includes development tools and is larger in size.

## Step 5: Wait for Build to Complete

- Build process takes 5-15 minutes
- You'll see build progress in the terminal
- Build happens on Expo's cloud servers (no local setup needed!)

## Step 6: Download Your APK

Once the build completes:

1. **Via Terminal**: The terminal will show a download URL
2. **Via Browser**: Go to https://expo.dev/accounts/[your-username]/projects/cash-flow-native/builds
3. **Via Email**: Expo will send you an email with download link

## Step 7: Install APK on Android Device

### Method 1: Direct Install (Recommended)
1. Transfer the APK file to your Android device
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Follow installation prompts

### Method 2: Share via QR Code
1. On the Expo build page, scan the QR code with your Android device
2. Download and install directly

## Build Profiles Explained

### 🚀 Production
- **Use for**: Final release, publishing to Play Store
- **Size**: Smallest (~30-50 MB)
- **Speed**: Slowest build time
- **Optimization**: Maximum

### 🧪 Preview
- **Use for**: Testing with team/clients
- **Size**: Medium (~40-60 MB)
- **Speed**: Medium build time
- **Optimization**: Moderate

### 🔧 Development
- **Use for**: Development/debugging
- **Size**: Largest (~60-80 MB)
- **Speed**: Fastest build time
- **Optimization**: Minimal

## Common Commands

```bash
# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]

# Cancel a running build
eas build:cancel

# Check account credentials
eas whoami
```

## Troubleshooting

### Build Failed?
1. Check your internet connection
2. Ensure `package.json` dependencies are valid
3. Run `npm install` to verify dependencies
4. Check build logs for specific errors

### APK Won't Install?
1. Enable "Install from Unknown Sources" in Android settings
2. Check if you have enough storage space
3. Try uninstalling previous version first

### Build Takes Too Long?
- Free Expo accounts have build queue priority
- Upgrade to paid plan for faster builds
- Or use local build (more complex setup)

## Updating Your App

When you make changes:

1. Update version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "android": {
         "versionCode": 2
       }
     }
   }
   ```

2. Rebuild APK:
   ```bash
   eas build --platform android --profile production
   ```

## Publishing to Google Play Store

1. Build production APK (or AAB for Play Store):
   ```bash
   eas build --platform android --profile production
   ```

2. Create Google Play Developer account ($25 one-time fee)

3. Upload APK/AAB to Play Console:
   - Go to https://play.google.com/console
   - Create new app
   - Upload APK/AAB
   - Fill in store listing details
   - Submit for review

## Local Build (Advanced)

If you want to build locally without Expo's servers:

```bash
# Setup
npm install -g turtle-cli
turtle setup:android

# Build
turtle build:android --type apk --release-channel production
```

Note: Local builds require Android SDK and more complex setup.

## Cost

- **EAS Build (Cloud)**: Free tier includes limited builds/month
  - Free: ~30 builds/month
  - Production: $29/month for unlimited builds

- **Google Play**: $25 one-time registration fee

## Support

- Expo Documentation: https://docs.expo.dev/build/setup/
- EAS Build Guide: https://docs.expo.dev/build/introduction/
- Expo Forum: https://forums.expo.dev/

---

**App Details:**
- Name: Cash Flow
- Package: com.xulqarnain.cashflow
- Version: 1.0.0
- Built with: React Native + Expo
- Developer: Xulqarnain

Happy Building! 🚀
