import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tenear.schoolmate',
  appName: 'SchoolMate',
  webDir: 'dist',
  server: {
    url: 'https://tenearedu.pages.dev/school/',
    cleartext: true,
    allowNavigation: ['tenearedu.pages.dev' ]
  }
};

export default config;
