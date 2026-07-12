import React, { useEffect } from 'react';
import { useSession } from '@openmrs/esm-framework';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import ClinicMetrics from '../metrics/metrics-container.component';
import DefaultQueueTable from '../queue-table/default-queue-table.component';
import { updateSelectedQueueLocationName, updateSelectedQueueLocationUuid } from '../store/store';

/**
 * The default view for a normal queue user (Clerk / Clinician): a focused, single-location
 * "patients waiting" view. Reuses the standard header, metrics, and table, but hides the
 * filters and locks the selected location to the user's session location.
 */
const FocusedQueueView: React.FC = () => {
  const session = useSession();
  const sessionLocation = session?.sessionLocation;

  useEffect(() => {
    if (sessionLocation?.uuid) {
      updateSelectedQueueLocationUuid(sessionLocation.uuid);
      updateSelectedQueueLocationName(sessionLocation.display);
    }
  }, [sessionLocation?.uuid, sessionLocation?.display]);

  return (
    <>
      <PatientQueueHeader showFilters={false} />
      <ClinicMetrics />
      <DefaultQueueTable />
    </>
  );
};

export default FocusedQueueView;
