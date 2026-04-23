import { Type } from '@openmrs/esm-framework';

export const dischargeWorkspaceSiderailExtensionConfigSchema = {
  allowedSessionLocationUuids: {
    _type: Type.Array,
    _default: [],
    _description:
      'If not empty, the discharge button will only show for users whose session location is included in this list. If empty, the discharge button will show for all locations.',
    _elements: {
      _type: Type.String,
    },
  },
};

export interface DischargeWorkspaceSiderailConfig {
  allowedSessionLocationUuids: string[];
}
