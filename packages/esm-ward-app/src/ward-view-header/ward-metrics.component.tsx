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
  { name: 'patients', key: 'patients',defaultTranslation:"Patients" },
  { name: 'freeBeds', key: 'freeBeds',defaultTranslation:"Free Beds"},
  { name: 'capacity', key: 'capacity',defaultTranslation:"Capacity" },
];

const WardMetrics = () => {
  const { location } = useWardLocation();
  const { beds, isLoading, error } = useBeds({ locationUuid: location.uuid });
  const {t} = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const wardPatientGroup = useAppContext<WardPatientGroupDetails>('ward-patients-group');

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error loading bed details'),
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
              metricName={t(`metrics.names.${wardMetric.name}`,wardMetric.defaultTranslation)}
              metricValue={t(`metrics.values.${wardMetric.name}`,wardMetricValues[wardMetric.key],{metricValue:wardMetricValues[wardMetric.key]})}
              isLoading={!!isLoading}
              key={wardMetric.key}
            />
          );
        })
      ) : (
        <WardMetric metricName={t(`metrics.names.patients`,"Patients")} metricValue={'--'} isLoading={false} key={'patients'} />
      )}
      {isBedManagementModuleInstalled && (
        <WardMetric
          metricName={t(`metrics.names.pendingOut`,"Pending Out")}
          metricValue={error ? '--' : wardPatientGroup?.wardPatientPendingCount.toString() ?? '--'}
          isLoading={!wardPatientGroup}
          key="pending"
        />
      )}
    </div>
  );
};

export default WardMetrics;
