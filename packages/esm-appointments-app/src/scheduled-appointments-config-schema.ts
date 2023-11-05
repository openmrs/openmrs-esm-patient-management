import { Type } from '@openmrs/esm-framework';

export const expectedAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'expected',
  },
  status: {
    _type: Type.String,
    _description:
      'The status to filter on, must be one of the valid appointment statues: Requested, Scheduled, CheckedIn, Completed, Cancelled, Missed',
    _default: 'Scheduled',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: false,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: true,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: true,
  },
};

export const checkedInAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'checkedIn',
  },
  status: {
    _type: Type.String,
    _description:
      'The status to filter on, must be one of the valid appointment statues: Requested, Scheduled, CheckedIn, Completed, Cancelled, Missed',
    _default: 'CheckedIn',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: false,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: true,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: false,
  },
};

export const completedAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'completed',
  },
  status: {
    _type: Type.String,
    _description:
      'The status to filter on, must be one of the valid appointment statues: Requested, Scheduled, CheckedIn, Completed, Cancelled, Missed',
    _default: 'Completed',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: true,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: true,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: false,
  },
};

export const missedAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'missed',
  },
  status: {
    _type: Type.String,
    _description:
      'The status to filter on, must be one of the valid appointment statues: Requested, Scheduled, CheckedIn, Completed, Cancelled, Missed',
    _default: 'Missed',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: true,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: false,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: false,
  },
};

export const cancelledAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'cancelled',
  },
  status: {
    _type: Type.String,
    _description:
      'The status to filter on, must be one of the valid appointment statues: Requested, Scheduled, CheckedIn, Completed, Cancelled, Missed',
    _default: 'Cancelled',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: true,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: true,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: true,
  },
};

export const earlyAppointmentsPanelConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'The title to display, may be a translation key or plain text',
    _default: 'cameEarly',
  },
  showForPastDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a past date',
    _default: true,
  },
  showForToday: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for today',
    _default: true,
  },
  showForFutureDate: {
    _type: Type.Boolean,
    _description: 'Whether to display this panel when viewing scheduled appointments for a future date',
    _default: false,
  },
};
