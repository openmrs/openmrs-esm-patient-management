import { Type, validators } from '@openmrs/esm-framework';

export const esmHomeSchema = {
  leftNavMode: {
    _type: Type.String,
    _description:
      'Allows making the left nav bar always collapsed (even on large screens) or completely hidden on the home page.',
    _validators: [validators.oneOf(['normal', 'collapsed', 'hidden'])],
    _default: 'normal',
  },
  defaultDashboardPerRole: {
    _type: Type.Object,
    _description:
      'Keys are OpenMRS user roles, values are names of dashboards (what goes in the URL after /home/). If a role\'s default dashboard is not configured here, "service-queues" is the default.',
    _elements: {
      _type: Type.String,
    },
    _default: {
      'Organizational: Registration Clerk': 'appointments',
    },
  },
};

export interface ConfigSchema {
  leftNavMode: 'normal' | 'collapsed' | 'hidden';
  defaultDashboardPerRole: Record<string, string>;
}
