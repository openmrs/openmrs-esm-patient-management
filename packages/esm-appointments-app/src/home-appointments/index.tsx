import React from 'react';
import { SWRConfig } from 'swr';

import AppointmentsBaseTable from './appointments-list.component';

const swrConfiguration = {
  errorRetryCount: 3,
};

const HomeAppointments = () => {
  return (
    <SWRConfig value={swrConfiguration}>
      <AppointmentsBaseTable />
    </SWRConfig>
  );
};

export default HomeAppointments;
