import React from 'react';
import AppointmentList from './appointments/appointment-list.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';

interface ClinicalAppointmentsProps {}

const ClinicalAppointments: React.FC<ClinicalAppointmentsProps> = () => {
  return (
    <div>
      <ClinicMetrics />
      <AppointmentList />
    </div>
  );
};

export default ClinicalAppointments;
