import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.your.app',
  appName: 'Mendly',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: [
      '10.0.2.2',
      'localhost',
      '127.0.0.1',
    ],
  },
};

export default config;
