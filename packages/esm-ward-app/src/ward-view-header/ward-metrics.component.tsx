import React from 'react';
import styles from './ward-metrics.scss';
import { useBeds } from '../hooks/useBeds';
import { showNotification, useAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { getWardMetrics } from '../ward-view/ward-view.resource';
import WardMetric from './ward-metric.component';
import type { WardPatientGroupDetails } from '../types';
import useWardLocation from '../hooks/useWardLocation';

const wardMetrics = [
  { name: 'Patients', key: 'patients' },
  { name: 'Free beds', key: 'freeBeds' },
  { name: 'Capacity', key: 'capacity' },
];

const WardMetrics = () => {
  const { location } = useWardLocation();
  const { beds, isLoading, error } = useBeds({ locationUuid: location.uuid });
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const wardPatientGroup = useAppContext<WardPatientGroupDetails>('ward-patients-group');

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error Loading Bed Details'),
      description: error.message,
    });
  }
  const wardMetricValues = getWardMetrics(beds, wardPatientGroup);
  return (
    <div className={styles.metricsContainer}>
      {isBedManagementModuleInstalled ? (
        wardMetrics.map((wardMetric) => {
          return (
            <WardMetric
              metricName={wardMetric.name}
              metricValue={wardMetricValues[wardMetric.key]}
              isLoading={!!isLoading}
              key={wardMetric.key}
            />
          );
        })
      ) : (
        <WardMetric metricName={'Patients'} metricValue={'--'} isLoading={false} key={'patients'} />
      )}
      {isBedManagementModuleInstalled && (
        <WardMetric
          metricName="Pending out"
          metricValue={error ? '--' : wardPatientGroup?.wardPatientPendingCount.toString() ?? '--'}
          isLoading={!wardPatientGroup}
          key="pending"
        />
      )}
    </div>
  );
};

export default WardMetrics;
