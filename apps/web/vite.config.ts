import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SALIENT_BASE lets the GitHub Pages workflow serve the app from /<repo-name>/.
export default defineConfig({
  plugins: [react()],
  base: process.env.SALIENT_BASE ?? '/',
});
