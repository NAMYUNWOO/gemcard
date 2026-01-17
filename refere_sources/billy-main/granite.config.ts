import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'billy',
  brand: {
    displayName: '빌리',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/NAMYUNWOO/myicons/main/billy/icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    outdir: 'dist',
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [
    {
      name: 'clipboard',
      access: 'read',
    },
    {
      name: 'clipboard',
      access: 'write',
    },
  ],
});
