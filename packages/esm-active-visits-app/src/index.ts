import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import activeVisitsComponent from './active-visits-widget/active-visits.component';
import visitDetailComponent from './visits-summary/visit-detail.component';
import MetricSlot from './metrics-slot.component';

const moduleName = '@openmrs/esm-active-visits-app';

const options = {
  featureName: 'active-visits',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const activeVisits = getSyncLifecycle(activeVisitsComponent, options);

export const visitDetail = getSyncLifecycle(visitDetailComponent, options);

export const homeActiveVisitsTile = getAsyncLifecycle(
  () => import('./active-visits-metric-tile/active-visits-tile.component'),
  options,
);
export const homeTotalVisitsTile = getAsyncLifecycle(
  () => import('./total-visits-metric-tile/total-visits-tile.component'),
  options,
);

export const metricsSlot = getSyncLifecycle(MetricSlot, options);
