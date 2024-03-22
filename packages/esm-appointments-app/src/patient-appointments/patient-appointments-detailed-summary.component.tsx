import React from 'react';
import PatientAppointmentsBase from './patient-appointments-base.component';

interface PatientAppointmentsDetailedSummaryProps {
  patientUuid: string;
}

const PatientAppointmentsDetailedSummary: React.FC<PatientAppointmentsDetailedSummaryProps> = ({ patientUuid }) => {
  return <PatientAppointmentsBase patientUuid={patientUuid} />;
};

export default PatientAppointmentsDetailedSummary;
