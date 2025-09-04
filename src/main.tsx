import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './print.css'

// Local font imports for signature functionality
import '@fontsource/dancing-script/400.css'
import '@fontsource/dancing-script/700.css'
import '@fontsource/great-vibes'
import '@fontsource/allura'
import '@fontsource/sacramento'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
