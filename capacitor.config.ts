import type { CapacitorConfig } from '@capacitor/cli';

// Production-ready Capacitor config for App Store submission.
// IMPORTANT: Do NOT add a `server.url` block — Apple rejects apps that
// load JavaScript from a remote URL. The web build bundled into `dist`
// is shipped inside the app.
const config: CapacitorConfig = {
  appId: 'com.shantelle.hoodlingo',
  appName: 'Hoodlingo',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#0F0A1E',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0F0A1E',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F0A1E',
      overlaysWebView: false,
    },
  },
};

export default config;
