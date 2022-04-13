import React from 'react';
import PatientListList from './appointment-list/patient-list-list/patient-list-list.component';
import ActiveVisitsTable from './appointment-tabs/booked/active-visits-table.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';

interface ClinicalAppointmentsProps {}

const ClinicalAppointments: React.FC<ClinicalAppointmentsProps> = () => {
  return (
    <div>
      <ClinicMetrics />
      <ActiveVisitsTable />
      <PatientListList />
    </div>
  );
};

export default ClinicalAppointments;
