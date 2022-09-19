import React from 'react';
import { SWRConfig } from 'swr';

import AppointmentsBaseTable from './appointments-list.component';
import Notification from './actionable-notifications/notification.component';

const swrConfiguration = {
  errorRetryCount: 3,
};

const HomeAppointments = () => {
  return (
    <SWRConfig value={swrConfiguration}>
      <AppointmentsBaseTable />
      <Notification />
    </SWRConfig>
  );
};

export default HomeAppointments;
