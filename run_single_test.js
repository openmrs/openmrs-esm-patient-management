const { execSync } = require('child_process');
try {
  execSync('yarn turbo run test --filter=@openmrs/esm-ward-app -- patient-discharge', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
