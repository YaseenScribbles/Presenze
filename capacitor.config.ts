import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.essa.presenze',
  appName: 'Presenze',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
