import React from 'react';
import PatientAppointmentsBase from './patient-appointments-base.component';

interface AppointmentOverviewProps {
  basePath: string;
  patientUuid: string;
}

const PatientAppointmentsOverview: React.FC<AppointmentOverviewProps> = ({ patientUuid }) => (
  <PatientAppointmentsBase patientUuid={patientUuid} />
);

export default PatientAppointmentsOverview;
