// Apps-in-Toss Web Framework Configuration
// Install: npm install @apps-in-toss/web-framework
// Then run: npx ait init

export default {
  appName: 'gemcard', // 앱인토스 콘솔에서 설정한 앱 이름
  brand: {
    displayName: 'GemCard', // 화면에 노출될 앱의 한글 이름
    primaryColor: '#1a1a2e', // 앱의 기본 색상
    icon: '', // 앱 아이콘 이미지 주소 (나중에 설정)
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  webViewProps: {
    type: 'game', // 전체 화면 사용 (게임/전체화면 콘텐츠용)
  },
  permissions: [],
};
