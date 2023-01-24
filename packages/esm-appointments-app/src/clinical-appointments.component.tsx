import React from 'react';
import AppointmentList from './appointments/appointment-list.component';
import ClinicMetrics from './appointment-metrics/appointment-metrics.component';

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
