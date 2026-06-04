# Shipping Hoodlingo to the App Store

This project is iOS-ready via Capacitor. Lovable can't push to the App Store for you — Apple requires submission from a Mac with Xcode. Follow these steps once, then repeat steps 4–9 for every update.

## One-time setup

1. **Apple Developer Program** — enroll at https://developer.apple.com/programs/ ($99/year). Required to ship to the store.
2. **Register the Bundle ID** — in Apple Developer → Identifiers → `+`, create an App ID with bundle `com.shantelle.hoodlingo` (must match `capacitor.config.ts`).
3. **App Store Connect** — at https://appstoreconnect.apple.com, click *My Apps → +* and create a new app with the same bundle ID.
4. **Export to GitHub** from Lovable (top-right menu), then `git clone` to your Mac.

## Build the native iOS project

```bash
cd hoodlingo
npm install
npx cap add ios            # first time only — creates ios/ folder
npm run build              # builds the web bundle into dist/
npx cap sync ios           # copies dist/ into the iOS app shell
```

## Generate app icons + splash

The 1024×1024 icon lives at `resources/icon.png`, splash at `resources/splash.png`.

```bash
npm install --save-dev @capacitor/assets
npx capacitor-assets generate --ios
```

This fans the source images out into every required iOS size and writes them into `ios/App/App/Assets.xcassets`.

## Open Xcode and submit

```bash
npx cap open ios
```

In Xcode:

1. Select the **App** project → **Signing & Capabilities** → pick your Team. Xcode auto-creates a provisioning profile.
2. Set the version (e.g. `1.0.0`) and Build number (e.g. `1`).
3. Pick **Any iOS Device (arm64)** as the run target (NOT a simulator).
4. **Product → Archive**. Wait for the build.
5. In the Organizer that pops up: **Distribute App → App Store Connect → Upload**.
6. Back in App Store Connect: the build appears under your app within ~15 minutes. Attach it to a version, fill in metadata from `APP_STORE_SUBMISSION.md`, and click **Submit for Review**.

Review typically takes 24–48 hours.

## Subsequent updates

Any time you pull new code from Lovable:

```bash
git pull
npm install
npm run build
npx cap sync ios
# in Xcode: bump build number, Archive, Upload
```

## Important gotchas

- **No remote JS**: `capacitor.config.ts` must NOT contain a `server.url` block in App Store builds. Already removed.
- **Privacy policy URL is required** before submission. Host one at `/privacy` on the web build.
- **Reviewer test account**: create one in your auth system and add the credentials in App Review Information, or Apple will reject.
- **Safe areas**: already handled via `env(safe-area-inset-*)` on the home shell.
- **Status bar**: configured dark on the deep purple background via the StatusBar plugin.

## Recommended Capacitor plugins to install on first build

```bash
npm install @capacitor/status-bar @capacitor/splash-screen
npx cap sync ios
```

These are already configured in `capacitor.config.ts` and activate automatically when installed.
