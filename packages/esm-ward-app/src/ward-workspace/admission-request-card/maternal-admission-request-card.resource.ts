import { type InpatientRequest, type WardPatient } from '../../types';

export function makeWardPatient(request: InpatientRequest): WardPatient {
  return {
    patient: request.patient,
    visit: request.visit,
    bed: null,
    inpatientAdmission: null,
    inpatientRequest: request,
  };
}
