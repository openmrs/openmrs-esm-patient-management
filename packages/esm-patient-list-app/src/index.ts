import { defineConfigSchema, getAsyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { getPatientListName } from './api/api-remote';
import { setupOffline } from './offline';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-list-app';
const options = {
  featureName: 'patient list',
  moduleName,
};

function setupOpenMRS() {
  const route = `patient-list`;
  const spaBasePath = `${window.spaBase}/${route}`;

  async function getName(x: string) {
    const name = await getPatientListName(x);
    return name;
  }

  setupOffline();
  defineConfigSchema(moduleName, {});

  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Patient Lists',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${spaBasePath}/:uuid?`,
      title: ([x]) => getName(`${x}`),
      parent: spaBasePath,
    },
  ]);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./root.component'), options),
        route,
        online: { syncUserPropertiesChangesOnLoad: true },
        offline: { syncUserPropertiesChangesOnLoad: false },
      },
    ],
    extensions: [
      {
        id: 'patient-list-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./patient-list-link.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'add-patient-to-patient-list-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./add-patient-to-patient-list-menu-item.component'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        name: 'patient-list-action-menu',
        slot: 'action-menu-non-chart-items-slot',
        load: getAsyncLifecycle(() => import('./patient-list-action-button.component'), {
          featureName: 'patient-list-action-menu-item',
          moduleName,
        }),
      },
      {
        id: 'add-patient-to-patient-list-modal',
        load: getAsyncLifecycle(() => import('./add-patient/add-patient.component'), {
          featureName: 'patient-actions-modal',
          moduleName,
        }),
      },
      {
        id: 'patient-table',
        load: getAsyncLifecycle(() => import('./patient-table/patient-table.component'), {
          featureName: 'patient-table',
          moduleName,
        }),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS, version };
