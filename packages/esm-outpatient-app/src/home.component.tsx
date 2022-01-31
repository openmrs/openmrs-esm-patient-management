import React from 'react';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <PatientQueueHeader />
      <ClinicMetrics />
    </div>
  );
};

export default Home;
