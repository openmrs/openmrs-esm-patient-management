import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  admissionLocationTagName: {
    _type: Type.String,
    _description: 'Patients may only be admitted to inpatient care in a location with this tag',
    _default: 'Admission Location',
  },
};

export interface BedManagementConfig {
  admissionLocationTagName: string;
}
