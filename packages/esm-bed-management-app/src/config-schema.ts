import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  admissionLocationTagName: {
    _type: Type.String,
    _default: 'Admission Location',
    _description: 'Patients may only be admitted to inpatient care in a location with this tag',
  },
};

export interface BedManagementConfig {
  admissionLocationTagName: string;
}
