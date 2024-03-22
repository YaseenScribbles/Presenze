import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ionic.presenze',
  appName: 'presenze',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
