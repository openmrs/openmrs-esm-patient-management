import { type Patient } from '@openmrs/esm-framework';
import { type PatientDetailsConfig } from '../config-schema';
import {
  getAdmittedPatientAge,
  getAdmittedPatientBedNo,
  getAdmittedPatientCity,
  getAdmittedPatientName,
  getAdmittedPatientReason,
  getAdmittedPatientTimeLapse,
} from './admitted-patient-details';

export function getPatientDetails(admittedPatientConfig: PatientDetailsConfig, patient: Patient) {
  const { admittedPatientDetails } = admittedPatientConfig;

  let map = new Map<string, React.ReactNode>();

  for (let admittedPatientDetail of admittedPatientDetails) {
    map.set(admittedPatientDetail.id, getFieldComponent(admittedPatientDetail.fieldType, patient));
  }
  return map;
}

function getFieldComponent(fieldType: string, patient: Patient) {
  switch (fieldType) {
    case 'patient-bed-number-field':
      return getAdmittedPatientBedNo(patient);
    case 'patient-name-field':
      return getAdmittedPatientName(patient);
    case 'patient-age-field':
      return getAdmittedPatientAge(patient);
    case 'patient-city-field':
      return getAdmittedPatientCity(patient);
    case 'patient-admitted-reason-field':
      return getAdmittedPatientReason(patient);
    case 'patient-time-lapse-field':
      return getAdmittedPatientTimeLapse(patient);
    default: {
      throw new Error('Unknown field type from configuration: ' + fieldType);
    }
  }
}
