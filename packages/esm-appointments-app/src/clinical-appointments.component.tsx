import React from 'react';
import PatientListList from './appointments/patient-list-list.component';
import AppointmentsTable from './tabs/appointments-table.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';

interface ClinicalAppointmentsProps {}

const ClinicalAppointments: React.FC<ClinicalAppointmentsProps> = () => {
  return (
    <div>
      <ClinicMetrics />
      <PatientListList />
    </div>
  );
};

export default ClinicalAppointments;
