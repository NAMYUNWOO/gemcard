import { defineConfig } from '@apps-in-toss/web-framework/config';
import { networkInterfaces } from 'os';

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of ['en0', 'eth0', 'wlan0']) {
    if (nets[name]) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

export default defineConfig({
  appName: 'billy',
  brand: {
    displayName: '빌리',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/NAMYUNWOO/myicons/main/billy/icon.png',
    bridgeColorMode: 'inverted',
  },
  web: {
    host: getLocalIP(),
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
