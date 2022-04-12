import React from 'react';
import ActiveVisitsTable from './active-visits/active-visits-table.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <ClinicMetrics />
      <ActiveVisitsTable />
    </div>
  );
};

export default Home;
