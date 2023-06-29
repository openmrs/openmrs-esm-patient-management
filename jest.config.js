/**
 * @returns {Promise<import('jest').Config>}
 */
module.exports = {
  transform: {
    '^.+\\.(j|t)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleNameMapper: {
    '\\.(s?css)$': 'identity-obj-proxy',
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '^lodash-es/(.*)$': 'lodash/$1',
    '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js',
    '^dexie$': require.resolve('dexie'),
  },
  collectCoverageFrom: [
    '**/src/**/*.component.tsx',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/src/**/*.test.*',
    '!**/src/declarations.d.tsx',
    '!**/e2e/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tools/setupTests.ts'],
  testPathIgnorePatterns: ['<rootDir>/packages/esm-form-entry-app', '<rootDir>/e2e'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};
