# 🌿 FoodSafe — Food Safety Scanner App

A React Native (Expo) mobile app that scans real product barcodes and tells you if they're safe
based on your health conditions: Diabetes, Gluten Allergy, Peanut Allergy, Vegan, and Vegetarian.

---

## 📁 Project Structure

```
foodsafe/
├── App.js                          # Root entry point
├── app.json                        # Expo config (name, icons, permissions)
├── eas.json                        # EAS Build config for app store deployment
├── babel.config.js
├── package.json
└── src/
    ├── engine/
    │   ├── analyzer.js             # ⭐ Safety analysis engine (60+ ingredients)
    │   └── api.js                  # Open Food Facts API (3M+ products, free)
    ├── hooks/
    │   └── useStorage.js           # AsyncStorage: conditions, history, onboarding
    ├── navigation/
    │   └── index.js                # React Navigation setup + custom tab bar
    ├── screens/
    │   ├── HomeScreen.js           # Dashboard with scan button + stats
    │   ├── ScannerScreen.js        # ⭐ REAL camera barcode scanner
    │   ├── ResultScreen.js         # Analysis result with expandable ingredients
    │   ├── ManualEntryScreen.js    # Paste ingredient text manually
    │   ├── HistoryScreen.js        # Scan history with persistence
    │   ├── EducationScreen.js      # Health education articles
    │   └── ProfileScreen.js        # Health condition toggles
    ├── components/
    │   └── index.js                # Shared UI: RatingBadge, Card, Button, etc.
    └── theme/
        └── index.js                # Colors, Typography, Spacing, Shadows
```

---

## 🚀 Quick Start (Development)

### 1. Prerequisites

```bash
# Install Node.js 18+ from nodejs.org
# Install Expo CLI
npm install -g expo-cli eas-cli

# Install dependencies
cd foodsafe
npm install
```

### 2. Run on your phone (easiest)

```bash
npx expo start
```

Then:
- **iOS**: Install "Expo Go" from App Store → scan QR code
- **Android**: Install "Expo Go" from Google Play → scan QR code

> ⚠️ **Camera scanning requires a real device** — it won't work in simulators.

### 3. Run on simulator (no camera)

```bash
# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator
npx expo start --android
```

---

## 📱 App Store Deployment

### Step 1: Create an Expo Account

1. Go to [expo.dev](https://expo.dev) → Sign up (free)
2. Create a new project: **"foodsafe"**
3. Get your `projectId` from the dashboard
4. Update `app.json`:
   ```json
   "extra": { "eas": { "projectId": "YOUR_ID_HERE" } }
   ```

### Step 2: Configure App Identity

Edit `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.YOURNAME.foodsafe"  ← must be unique globally
  },
  "android": {
    "package": "com.YOURNAME.foodsafe"           ← must be unique globally
  }
}
```

### Step 3: Login to EAS

```bash
eas login
eas build:configure
```

---

## 🍎 iOS App Store (Apple)

### Requirements
- **Mac computer** (or use EAS cloud build — no Mac needed!)
- Apple Developer Account: [developer.apple.com](https://developer.apple.com) — **$99/year**
- App Store Connect account (same login)

### Build for iOS

```bash
# Build in the cloud (no Mac needed!)
eas build --platform ios

# This will:
# 1. Ask you to log in to your Apple account
# 2. Auto-create certificates and provisioning profiles
# 3. Build in Expo's cloud servers (~15-20 min)
# 4. Give you a download link for the .ipa file
```

### Submit to App Store

```bash
# Auto-submit to App Store Connect
eas submit --platform ios
```

Then in **App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com)):
1. Fill in app metadata (description, screenshots, keywords)
2. Set age rating
3. Add privacy policy URL (required — host a simple page)
4. Submit for review (~1-3 days review time)

### Required before submission:
- [ ] App icon (1024×1024 PNG, no transparency) — save as `assets/icon.png`
- [ ] Screenshots for iPhone 6.5" and 5.5" (use simulator)
- [ ] Privacy policy URL
- [ ] App description (max 4000 chars)
- [ ] Keywords (max 100 chars)

---

## 🤖 Google Play Store (Android)

### Requirements
- Google Play Developer Account: [play.google.com/console](https://play.google.com/console) — **$25 one-time fee**

### Build for Android

```bash
# Build Android App Bundle (recommended for Play Store)
eas build --platform android --profile production
```

### Submit to Google Play

```bash
# Option 1: Auto-submit with EAS
eas submit --platform android

# Option 2: Manual upload
# Download .aab file from EAS dashboard
# Upload at play.google.com/console
```

In **Google Play Console**:
1. Create new app → fill in details
2. Upload the `.aab` file
3. Fill store listing (description, screenshots, icon)
4. Complete content rating questionnaire
5. Set up pricing (free)
6. Submit for review (~1-7 days review time)

### Required before submission:
- [ ] App icon (512×512 PNG)
- [ ] Feature graphic (1024×500 PNG)
- [ ] Screenshots (min 2, phone screenshots)
- [ ] Privacy policy URL
- [ ] App description

---

## 🔑 App Store Optimization (ASO) — Keywords

**Suggested keywords:**
`food scanner, barcode scanner, food allergy, gluten free, vegan food checker, diabetes food, ingredient checker, food safety, allergen detector`

**Suggested description opening:**
> "FoodSafe instantly tells you if any food product is safe for YOUR diet. Just scan the barcode — we check every ingredient against your health conditions: diabetes, gluten intolerance, peanut allergy, vegan, and vegetarian."

---

## 🔄 Customization

### Add new ingredients to the safety engine

Edit `src/engine/analyzer.js` — add entries to `INGREDIENT_DB`:

```js
'new ingredient': {
  conditions: ['diabetes'],       // which conditions it affects
  severity: 'avoid',              // 'avoid' or 'caution'
  reason: 'Explanation for user.',
  category: 'Sugar',              // displayed as category label
},
```

### Add new health conditions

1. Add to `CONDITIONS` array in `analyzer.js`
2. Add color/icon in `src/theme/index.js`
3. Add relevant ingredients to `INGREDIENT_DB`
4. Add condition card in `ProfileScreen.js`

### Change app colors

Edit `src/theme/index.js` → `Colors` object.
The primary green is `#2e7d32` / `#1b5e20`.

---

## 📊 Data Source

This app uses the **Open Food Facts** API:
- **Free, no API key required**
- 3,000,000+ products worldwide
- Community-maintained database
- Covers US, EU, and global products
- API docs: [world.openfoodfacts.org/data](https://world.openfoodfacts.org/data)

---

## 💰 Monetization Ideas

- **Freemium**: 10 free scans/month, then $2.99/month
- **Premium**: Advanced analytics, personalized meal suggestions
- **White label**: License to nutritionists, hospitals, gyms
- **Affiliate**: Partner with health food brands (mark as sponsored)

---

## 📋 Privacy Policy Template

You'll need a privacy policy to publish. Key points to include:
- We do not store any personal information
- Scan history is stored locally on device only
- Camera is used only for barcode scanning
- No photos are saved or transmitted
- Product data fetched from Open Food Facts (anonymous requests)

Host it on a free service like GitHub Pages or Notion.

---

## 🐛 Common Issues

**"Camera not working on simulator"**
→ Use a real device for barcode scanning. Install Expo Go.

**"Product not found"**
→ Open Food Facts doesn't have 100% coverage. Use Manual Entry for unlisted products.

**"Build failed - certificates"**
→ Run `eas credentials` to manage your Apple certificates.

**"Android build - keystore"**
→ EAS manages this automatically. Don't delete the keystore — you need it for updates!

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 51 |
| Navigation | React Navigation 6 |
| Camera/Scanning | expo-camera (barcode scanner built-in) |
| Storage | AsyncStorage (local, offline) |
| Product Database | Open Food Facts API (free, 3M+ products) |
| Haptics | expo-haptics |
| Animations | React Native Animated API |
| Build & Deploy | EAS Build + EAS Submit |
| Design System | Custom Material 3, teal/green palette |

---

Made with 🌿 by FoodSafe
