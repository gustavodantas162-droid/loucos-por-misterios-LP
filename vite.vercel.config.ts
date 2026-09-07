import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';

export default defineConfig({
  root: '.',
  build: { outDir: 'dist-vercel', emptyOutDir: true },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
});
