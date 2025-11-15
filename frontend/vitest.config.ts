import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    // מונע מריצת בדיקות לפתוח כמה תהליכים שמקימים WS/שרתים במקביל
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // יציבות JSDOM
    environmentOptions: {
      jsdom: {
        pretendToBeVisual: true,
        url: 'http://localhost',
      },
    },
    // ניקוי אוטומטי
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['dot'],
  },
});
