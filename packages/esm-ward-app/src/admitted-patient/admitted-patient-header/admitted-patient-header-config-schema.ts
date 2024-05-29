import { PersonAddress, Type } from '@openmrs/esm-framework';

export const admittedPatientHeaderAddressConfigSchema = {
  addressType: {
    _type: Type.String,
    _description: 'The type of address to display. Supports "preferred" or "all".',
    _default: 'preferred',
  },
  fields: {
    _type: Type.Array,
    _description: "The list of PersonAddress fields to display",
    _default: ['stateProvince', 'country']
  }
};

export interface AdmittedPatientHeaderAddressConfigObject {
  addressType?: "preferred" | "all",
  fields: Array<keyof PersonAddress>
}