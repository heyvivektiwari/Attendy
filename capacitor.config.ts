import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.attendy.app',
  appName: 'Attendy',
  webDir: 'public',  // minimal, since we use a remote URL

  server: {
    // Load the live Vercel website directly
    url: 'https://attendyltce.vercel.app',
    cleartext: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1A132F',
      showSpinner: true,
      spinnerColor: '#2ec7ff',
      androidSpinnerStyle: 'large',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      backgroundColor: '#1A132F',
      style: 'DARK',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },

  android: {
    backgroundColor: '#1A132F',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  ios: {
    backgroundColor: '#1A132F',
    contentInset: 'always',
  },
};

export default config;
