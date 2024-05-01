import React from 'react';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import DefaultQueueTable from './queue-table/default-queue-table.component';

const Home: React.FC = () => {
  return (
    <>
      <PatientQueueHeader />
      <ClinicMetrics />
      <DefaultQueueTable />
    </>
  );
};

export default Home;
