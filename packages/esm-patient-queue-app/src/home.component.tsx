import React from 'react';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <PatientQueueHeader />
    </div>
  );
};

export default Home;
