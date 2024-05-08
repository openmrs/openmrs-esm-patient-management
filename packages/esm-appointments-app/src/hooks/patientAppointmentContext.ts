import { createContext } from 'react';

/**
 * When rendering the Patient Appointments view, let the view know if this is being rendered in the Patient Chart or the Appointments App
 * (we need to know this to determine if we open the appointments form as part of the patient chart workspace or as an overlay in the appointments app)
 */
export enum PatientAppointmentContextTypes {
  PATIENT_CHART,
  APPOINTMENTS_APP,
}
const PatientAppointmentContext = createContext<PatientAppointmentContextTypes>(
  PatientAppointmentContextTypes.PATIENT_CHART,
);

export default PatientAppointmentContext;
