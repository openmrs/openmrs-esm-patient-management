import { Type, validators } from '@openmrs/esm-framework';

export const configSchema = {
  leftNavMode: {
    _type: Type.String,
    _default: 'normal',
    _description:
      'Allows making the left nav bar always collapsed (even on large screens) or completely hidden on the home page.',
    _validators: [validators.oneOf(['normal', 'collapsed', 'hidden'])],
  },
  defaultDashboardPerRole: {
    _type: Type.Object,
    _default: {
      'Organizational: Registration Clerk': 'appointments',
    },
    _description:
      'Keys are OpenMRS user roles, values are names of dashboards (what goes in the URL after /home/). If a role\'s default dashboard is not configured here, "service-queues" is the default.',
    _elements: {
      _type: Type.String,
    },
  },
};

export interface HomeConfig {
  leftNavMode: 'normal' | 'collapsed' | 'hidden';
  defaultDashboardPerRole: Record<string, string>;
}
