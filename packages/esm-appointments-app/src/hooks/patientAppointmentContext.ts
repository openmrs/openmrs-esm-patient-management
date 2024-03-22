import { createContext } from 'react';

export enum PatientAppointmentContextTypes {
  PATIENT_CHART,
  APPOINTMENTS_APP,
}
const PatientAppointmentContext = createContext(PatientAppointmentContextTypes.PATIENT_CHART);

export default PatientAppointmentContext;
