import { generateFileSizeReport } from '@jsenv/file-size-impact';
import { promises } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(currentDir, '..', 'packages');
const manifestConfig = {};
const trackingConfig = {};

async function setPackages() {
  const names = await promises.readdir(packagesDir);

  await Promise.all(
    names.map(async (name) => {
      const p = resolve(packagesDir, name);
      const stat = await promises.stat(p);

      if (stat.isDirectory()) {
        const pj = resolve(p, 'package.json');
        const content = await promises.readFile(pj, 'utf8');
        const packageName = JSON.parse(content).name;
        manifestConfig[`./packages/${name}/dist/*.buildmanifest.json`] = true;
        trackingConfig[packageName] = {
          [`./packages/${name}/dist/*.js`]: true,
          [`./packages/${name}/dist/*.css`]: true,
          [`./packages/${name}/dist/*.map`]: false,
          [`./packages/${name}/dist/*.txt`]: false,
          [`./packages/${name}/dist/*.json`]: false,
        };
      }
    }),
  );
}

await setPackages();

export const fileSizeReport = await generateFileSizeReport({
  log: process.argv.includes('--log'),
  projectDirectoryUrl: new URL('../', import.meta.url),
  manifestConfig,
  trackingConfig,
});
