import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts: the app makes no third-party requests.
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/700.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
