import React from 'react';
import styles from './ward-metrics.scss';
import { useBeds } from '../hooks/useBeds';
import { useParams } from 'react-router-dom';
import { showNotification } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { getWardMetrics } from '../ward-view/ward-view.resource';
import WardMetric from './ward-metric.component';

const wardMetrics = [
  { name: 'Patients', key: 'patients' },
  { name: 'Free beds', key: 'freeBeds' },
  { name: 'Capacity', key: 'capacity' },
];
const WardMetrics = () => {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { beds, isLoading, error } = useBeds({ locationUuid: locationUuidFromUrl });
  const { t } = useTranslation();
  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error Loading Bed Details'),
      description: error.message,
    });
  }
  const wardMetricValues = getWardMetrics(beds);
  return (
    <div className={styles.metricsContainer}>
      {wardMetrics.map((wardMetric) => (
        <WardMetric
          metricName={wardMetric.name}
          metricValue={wardMetricValues[wardMetric.key]}
          isLoading={!!isLoading}
          key={wardMetric.key}
        />
      ))}
      {/* TODO: use real time value when the api is ready */}
      <WardMetric metricName="Pending out" metricValue="10" isLoading={false} />
    </div>
  );
};

export default WardMetrics;
