import { getSyncLifecycle } from '@openmrs/esm-framework';
import rootComponent from './root.component';
import { wardViewDashboardMeta } from './dashboard.meta';
import { createDashboardLink } from './createDashboardLink.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-ward-app';

const options = {
  featureName: 'ward',
  moduleName,
};

export const root = getSyncLifecycle(rootComponent, options);

// TODO: uncomment this for the link to the ward app to appear on the left hand nav when the app is more ready
// export const wardViewDashboardLink = getSyncLifecycle(createDashboardLink(wardViewDashboardMeta), options);
