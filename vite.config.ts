import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'index.html',
        blitzableiter: 'blitzableiter/index.html',
        slop: 'jack-vs-slop/index.html',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
