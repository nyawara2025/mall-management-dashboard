import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tenear.churchmate',
  appName: 'ChurchMate',
  webDir: 'dist',
  server: {
    url: 'https://tenearchurch.pages.dev/church/',
    cleartext: true
  }
};

export default config;
