import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: {
      overlay: false, // Disables the error overlay if you only want console errors
      clientPort: 443, // Используем порт 443 для WebSocket соединения
      host: 'preview--neuro-chat-dark-mode.poehali.dev' // Указываем хост для WebSocket соединения
    }
  },
});
