import openmrs from '@openmrs/eslint-config';

export default [
  { ignores: ['**/dist/**', '**/*.d.ts', '.yarn/**'] },
  ...openmrs,
  {
    rules: {
      // Rules this repo enforces that the shared config leaves off. The two
      // ban-types successors come from typescript-eslint's recommended preset,
      // which this repo was picking up before the migration.
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always', allowObjectTypes: 'always' }],
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // These packages are free of `any` and keep it that way. The rest of the
    // repo leaves the rule off until they catch up.
    files: [
      'packages/esm-active-visits-app/**',
      'packages/esm-appointments-app/**',
      'packages/esm-home-app/**',
      'packages/esm-patient-list-management-app/**',
      'packages/esm-patient-search-app/**',
      'packages/esm-ward-app/**',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Playwright fixtures take a callback named `use` and call it to supply the
    // fixture value. eslint-plugin-react-hooks reads that as React's `use` hook
    // and reports it as a hook called outside a component.
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
