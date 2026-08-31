import React from 'react';
import { InlineNotification, SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import type { Queue } from '../types';
import { type ConfigObject } from '../config-schema';
import { QueueTableByStatusSkeleton } from '../queue-table/queue-table-by-status-skeleton.component';
import AttendingPatients from '../attending-patients/attending-patients.component';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import DefaultQueueTable from '../queue-table/default-queue-table.component';
import QueueTableMetrics from '../queue-table/queue-table-metrics.component';

interface QueueTablesForAllStatusesProps {
  selectedQueue: Queue; // the selected queue
  isLoadingQueue: boolean; // whether the queue is still loading
  errorFetchingQueue: Error;
}

/**
 * A single queue, presented as the clinic-wide dashboard presents a location: patients being attended
 * as cards, then a table per remaining status.
 */
const QueueTablesForAllStatuses: React.FC<QueueTablesForAllStatusesProps> = ({
  selectedQueue,
  isLoadingQueue,
  errorFetchingQueue,
}) => {
  const { t } = useTranslation();
  const {
    concepts: { defaultTransitionStatus },
  } = useConfig<ConfigObject>();

  if (errorFetchingQueue) {
    return (
      <InlineNotification
        kind="error"
        title={t('invalidQueue', 'Invalid Queue')}
        subtitle={errorFetchingQueue?.message}
      />
    );
  }

  const allowedStatuses = selectedQueue?.allowedStatuses ?? [];

  // In-service patients are the Attending cards, so they get no table of their own.
  const tabledStatuses = [...allowedStatuses].reverse().filter((status) => status.uuid !== defaultTransitionStatus);

  return (
    <>
      <PatientQueueHeader title={!isLoadingQueue ? selectedQueue?.display : <SkeletonText />} />
      {isLoadingQueue ? (
        <QueueTableByStatusSkeleton />
      ) : (
        <>
          <QueueTableMetrics selectedQueue={selectedQueue} />
          <AttendingPatients queueUuid={selectedQueue.uuid} />
          {/* Only a queue allowing no status at all is misconfigured: one allowing just the
              in-service status has no table, but the Attending cards above are its list. */}
          {allowedStatuses.length === 0 ? (
            <InlineNotification
              kind="error"
              lowContrast
              subtitle={t('configureStatus', 'Please configure status to continue.')}
              title={t('noStatusConfigured', 'No status configured')}
            />
          ) : (
            tabledStatuses.map((status) => (
              <DefaultQueueTable key={status.uuid} queueUuid={selectedQueue.uuid} status={status} />
            ))
          )}
        </>
      )}
    </>
  );
};

export default QueueTablesForAllStatuses;
