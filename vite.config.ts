import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'index.html',
        blitzableiter: 'blitzableiter/index.html',
        slop: 'jack-vs-slop/index.html',
        echo: 'echo/index.html',
        zeitfinger: 'zeitfinger/index.html',
        sonar: 'sonar/index.html',
        dungeon: 'dungeon-deal/index.html',
        pissoir: 'pissoir/index.html',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
