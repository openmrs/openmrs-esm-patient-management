import { type PersonAddress, Type } from '@openmrs/esm-framework';

export const admittedPatientHeaderAddressConfigSchema = {
  addressType: {
    _type: Type.String,
    _description: 'The type of address to display. Supports "preferred" or "all".',
    _default: 'preferred',
  },
  fields: {
    _type: Type.Array,
    _description: 'The list of PersonAddress fields to display',
    _default: ['stateProvince', 'country'],
  },
};

export const admittedPatientHeaderNameConfigSchema = {
  displayName: {
    _type: Type.String,
    _description: 'Specifies how to display name. Supports "normal" or "reverse"',
    _default: 'reverse',
  },
};