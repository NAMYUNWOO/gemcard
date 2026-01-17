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
  appName: 'gemcard',
  brand: {
    displayName: '운명의 보석',
    primaryColor: '#1a1a2e',
    icon: 'https://raw.githubusercontent.com/NAMYUNWOO/myicons/main/gemcard/icon.png',
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
    { name: 'clipboard', access: 'read' },
    { name: 'clipboard', access: 'write' },
  ],
});
