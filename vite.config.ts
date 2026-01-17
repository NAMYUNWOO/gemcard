import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // 앱인토스 WebView 배포 필수 - 상대 경로 사용
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
