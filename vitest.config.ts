import { defineConfig } from 'vitest/config';

process.env.TZ = 'UTC';

export default defineConfig({
  resolve: {
    alias: [{ find: /^.*\.s?css$/, replacement: 'identity-obj-proxy' }],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    setupFiles: [new URL('./tools/setup-tests.ts', import.meta.url).pathname],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['**/src/**/*.component.tsx'],
      exclude: ['**/node_modules/**', '**/vendor/**', '**/src/**/*.test.*', '**/src/declarations.d.ts', '**/e2e/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    server: {
      deps: {
        inline: [/@openmrs/],
      },
    },
    fakeTimers: {
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
      ],
    },
    alias: [
      { find: '@openmrs/esm-framework/src/internal', replacement: '@openmrs/esm-framework/mock' },
      { find: /^@openmrs\/esm-framework$/, replacement: '@openmrs/esm-framework/mock' },
      { find: /^@openmrs\/esm-translations$/, replacement: '@openmrs/esm-translations/mock' },
      { find: 'react-i18next', replacement: new URL('./__mocks__/react-i18next.js', import.meta.url).pathname },
      { find: /^tools$/, replacement: new URL('./tools/index.ts', import.meta.url).pathname },
      { find: /^tools\/(.*)$/, replacement: new URL('./tools/', import.meta.url).pathname + '$1' },
      { find: /^__mocks__$/, replacement: new URL('./__mocks__/index.ts', import.meta.url).pathname },
      { find: /^__mocks__\/(.*)$/, replacement: new URL('./__mocks__/', import.meta.url).pathname + '$1' },
      { find: /^uuid$/, replacement: new URL('./node_modules/uuid/dist/index.js', import.meta.url).pathname },
    ],
  },
});
