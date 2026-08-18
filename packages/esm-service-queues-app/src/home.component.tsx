import React from 'react';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import QueueLocationHeaderTitle from './patient-queue-header/queue-location-header-title.component';
import ClinicMetrics from './metrics/metrics-container.component';
import AttendingPatients from './attending-patients/attending-patients.component';
import DefaultQueueTable from './queue-table/default-queue-table.component';

const Home: React.FC = () => {
  return (
    <>
      <PatientQueueHeader title={<QueueLocationHeaderTitle />} actions={<ClinicMetrics />} />
      <AttendingPatients />
      <DefaultQueueTable />
    </>
  );
};

export default Home;
