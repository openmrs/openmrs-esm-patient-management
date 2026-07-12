import React from 'react';
import { useSession, userHasAccess } from '@openmrs/esm-framework';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import ClinicMetrics from './metrics/metrics-container.component';
import DefaultQueueTable from './queue-table/default-queue-table.component';
import FocusedQueueView from './views/focused-queue-view.component';
import { CLERK_PRIVILEGE, CLINIC_ADMIN_PRIVILEGE, CLINICIAN_PRIVILEGE } from './constants';

const Home: React.FC = () => {
  const session = useSession();
  const user = session?.user;
  const isClinicAdmin = !!user && userHasAccess(CLINIC_ADMIN_PRIVILEGE, user);
  // userHasAccess treats an array as "all required", so OR the two privileges separately.
  const isQueueUser = !!user && (userHasAccess(CLERK_PRIVILEGE, user) || userHasAccess(CLINICIAN_PRIVILEGE, user));

  if (isQueueUser && !isClinicAdmin) {
    return <FocusedQueueView />;
  }

  // Admins fall through to the existing view; O3-5770 adds their monitoring screen here.
  return (
    <>
      <PatientQueueHeader showFilters />
      <ClinicMetrics />
      <DefaultQueueTable />
    </>
  );
};

export default Home;
