import { Type, validators } from '@openmrs/esm-framework';

export const esmHomeSchema = {
  leftNavMode: {
    _type: Type.String,
    _description:
      'Allows making the left nav bar always collapsed (even on large screens) or completely hidden on the home page.',
    _default: 'normal',
    _validators: [validators.oneOf(['normal', 'collapsed', 'hidden'])],
  },
  defaultDashboardPerRole: {
    _type: Type.Array,
    _elements: {
      key: {
        _type: Type.String,
        _description: 'OpenMRS user role',
      },
      value: {
        _type: Type.String,
        _description: 'Name of dashboard (what goes in the URL after /home/)',
      },
    },
    _description:
      'Keys are OpenMRS user roles, values are names of dashboards (what goes in the URL after /home/). If a role\'s default dashboard is not configured here, "service-queues" is the default.',
    _default: [
      {
        key: 'Organizational: Registration Clerk',
        value: 'appointments',
      },
    ],
  },
};

export interface ConfigSchema {
  leftNavMode: 'normal' | 'collapsed' | 'hidden';
  defaultDashboardPerRole: Record<string, string>;
}
