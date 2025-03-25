import React from 'react';
import PatientAppointmentsBase from './patient-appointments-base.component';
import {
  PatientAppointmentContextProvider,
  PatientAppointmentContextTypes,
} from '../hooks/patient-appointment-context';

interface PatientAppointmentsDetailedSummaryProps {
  patientUuid: string;
}
/**
 * This component is wired in as an extension to render the patient appointments view (all appointments for a single patient) within of the context of the patient chart.
 * It uses the PatientAppointmentsBase component to render the actual appointments data.
 */
const PatientAppointmentsDetailedSummary: React.FC<PatientAppointmentsDetailedSummaryProps> = ({ patientUuid }) => {
  return (
    <PatientAppointmentContextProvider value={PatientAppointmentContextTypes.PATIENT_CHART}>
      <PatientAppointmentsBase patientUuid={patientUuid} />
    </PatientAppointmentContextProvider>
  );
};

export default PatientAppointmentsDetailedSummary;
