# Deploy Hoodlingo to the Apple App Store

Lovable can't push to the App Store for you — Apple requires submission from a Mac with Xcode, signed by your paid Apple Developer account. What I *can* do is get the project 100% ready for submission so the only remaining work happens on your Mac.

## What you'll need before we start

- Apple Developer Program membership ($99/year) — https://developer.apple.com/programs/
- A Mac with the latest Xcode installed
- An App Store Connect account (comes with Developer Program)
- Your own GitHub repo (via Lovable "Export to GitHub")

## Part 1 — What I'll prepare in Lovable (code side)

1. **Lock down `capacitor.config.ts` for production**
   - Remove any `server.url` hot-reload block (must be gone for App Store builds — Apple rejects apps that load remote JS).
   - Keep `appId: com.shantelle.hoodlingo`, `appName: Hoodlingo`, `webDir: dist`.
   - Add iOS-safe defaults: `ios.contentInset: 'always'`, splash screen + status bar plugin config.

2. **iOS polish pass**
   - Add safe-area padding (notch + home indicator) to the main shell and the door-kick auth screen so nothing gets clipped on iPhone.
   - Confirm `@capacitor/haptics` calls degrade gracefully on web.
   - Add `@capacitor/status-bar` + `@capacitor/splash-screen` (dark purple to match the brand).

3. **App icon + splash assets**
   - Generate 1024×1024 App Store icon + splash in the urban hip-hop aesthetic (dark purple, Russo One wordmark) and place them so `@capacitor/assets` can fan them out into every required iOS size.

4. **Stripe paywall on iOS — important call-out**
   - Apple requires **In-App Purchase (StoreKit)** for digital goods like the $1 unlock, not Stripe. Shipping Stripe-only will get the app **rejected**.
   - Two paths (pick one in the questions below):
     - **A. Swap the $1 unlock to StoreKit** (RevenueCat or `@capacitor-community/in-app-purchases`). Stripe stays for web.
     - **B. Ship as a free app for v1**, remove the paywall on iOS only, keep Stripe on web. Fastest path to approval.

5. **App Store metadata file** — I'll generate a `APP_STORE_SUBMISSION.md` with ready-to-paste copy for: app name, subtitle, promotional text, description, keywords, support URL, privacy policy URL, age rating answers, and category (Games → Trivia).

## Part 2 — What you do on your Mac (one-time)

```text
1. Export to GitHub (button in Lovable), then `git clone` to your Mac
2. npm install
3. npx cap add ios
4. npm run build && npx cap sync ios
5. npx cap open ios          # opens Xcode
6. In Xcode: select your Team (Signing & Capabilities), set version 1.0.0 / build 1
7. Product → Archive → Distribute App → App Store Connect → Upload
8. In App Store Connect: create the app listing, attach the build, submit for review
```

Review typically takes 24–48 hours. First submission often gets one rejection — usually for missing privacy policy URL or IAP issues — which is why Part 1 matters.

## Technical details

- **Bundle ID** stays `com.shantelle.hoodlingo` — register this exact ID in your Apple Developer account under Identifiers before the first Xcode upload.
- **Privacy manifest** (`PrivacyInfo.xcprivacy`) required since 2024: I'll add one declaring our data use (email for auth, gameplay scores).
- **App Tracking Transparency**: not needed unless we add ad SDKs (we don't).
- **Push notifications**: not in scope here; the weekly digest is email-based.
- **Backend**: nothing to change — Supabase/Lovable Cloud works the same from a native shell.

## Questions before I start

I need two decisions to know exactly what to build in Part 1.
