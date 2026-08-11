import type { CapacitorConfig } from '@capacitor/cli';

// Dynamic fallback system: Defaults to ChurchMate if zero environment variables are provided
const config: CapacitorConfig = {
  appId: process.env.CAP_APP_ID || 'com.tenear.churchmate',
  appName: process.env.CAP_APP_NAME || 'ChurchMate',
  webDir: 'dist',
  server: process.env.CAP_SERVER_URL 
    ? { url: process.env.CAP_SERVER_URL, cleartext: true }
    : {  url: 'https://tenearchurch.pages.dev/church/', cleartext: true }
};

export default config;
