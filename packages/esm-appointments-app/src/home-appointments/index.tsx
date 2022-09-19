import React from 'react';
import AppointmentsBaseTable from './appointments-list.component';
import Notification from './actionable-notifications/notification.component';

const HomeAppointments = () => {
  return (
    <>
      <AppointmentsBaseTable />
      <Notification />
    </>
  );
};

export default HomeAppointments;
