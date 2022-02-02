import React from 'react';
import ActiveVisitsListTable from './active-visits-list/active-visits-list-table.component';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <PatientQueueHeader />
      <ClinicMetrics />
      <ActiveVisitsListTable />
    </div>
  );
};

export default Home;
