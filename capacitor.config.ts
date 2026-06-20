import type { CapacitorConfig } from '@capacitor/cli';

const isSchool = process.env.APP_TARGET === 'school';

const config: CapacitorConfig = {
  appId: isSchool ? 'com.tenear.schoolmate' : 'com.tenear.churchmate',
  appName: isSchool ? 'SchoolMate' : 'ChurchMate',
  webDir: 'dist',
  server: {
    url: isSchool ? 'https://tenearedu.pages.dev/school/' : 'https://tenearchurch.pages.dev/church/',
    cleartext: true
  }
};

export default config;
