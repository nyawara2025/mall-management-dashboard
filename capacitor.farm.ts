import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tenear.schoolmate',
  appName: 'FarmMate',
  webDir: 'dist',
  server: {
    url: 'https://sbo2.pages.dev/',
    cleartext: true,
    allowNavigation: ['sbo2.pages.dev' ]
  }
};

export default config;
