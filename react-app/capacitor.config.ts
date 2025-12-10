// react-app/capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fadi.Mendly',   // or whatever ID you chose
  appName: 'Mendly',
  webDir: 'dist',             // Vite build output
};

export default config;
