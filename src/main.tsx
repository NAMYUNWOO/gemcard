import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <TDSMobileAITProvider>
    <App />
  </TDSMobileAITProvider>
)
