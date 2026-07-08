import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tenear.farmmate', // Unique identifier separate from church/school
  appName: 'TeNEARFarmMate',                // The name that will show under the icon
  webDir: 'dist',
  server: {
    url: 'https://sbo2.pages.dev/farm/',
    cleartext: true,
    allowNavigation: ['sbo2.pages.dev']
  }
};

export default config;
