import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initializeEnvironmentDetection } from './utils/environment'

// Initialize environment detection early for accurate Toss WebView detection
// This enables proper ad/IAP functionality in test environments (QR scan)
initializeEnvironmentDetection();

createRoot(document.getElementById('root')!).render(
  <TDSMobileAITProvider>
    <App />
  </TDSMobileAITProvider>
)
