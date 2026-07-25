import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sizat.esd',
  appName: 'SiZat-ESD',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
