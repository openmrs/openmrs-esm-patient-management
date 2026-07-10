import { type PlaywrightWorkerArgs, type WorkerFixture } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { EmrApiConfigurationResponse } from '../../packages/esm-ward-app/src/hooks/useEmrConfiguration';

const emrConfigurationStatePath = 'e2e/.emr-configuration.json';

export const emrConfiguration: WorkerFixture<EmrApiConfigurationResponse, PlaywrightWorkerArgs> = async (_, use) => {
  const stateContent = await readFile(emrConfigurationStatePath, 'utf8');
  const configuration = JSON.parse(stateContent) as EmrApiConfigurationResponse;

  if (!configuration) {
    throw new Error('Unable to read the EMR configuration from the shared Playwright state.');
  }

  await use(configuration);
};
