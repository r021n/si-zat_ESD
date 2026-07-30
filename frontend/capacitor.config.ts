import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sizat.esd',
  appName: 'SiZat-ESD',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '309310930641-v44l2fjvgl3a9i9455lrueuv2df66i5f.apps.googleusercontent.com',
      },
    },
  },
};

export default config;
