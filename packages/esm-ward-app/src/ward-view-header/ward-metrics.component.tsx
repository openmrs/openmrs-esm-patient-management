import { showNotification, useAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WardMetricType, type WardViewContext } from '../types';
import { getWardMetricNameTranslation, getWardMetrics } from '../ward-view/ward-view.resource';
import WardMetric from './ward-metric.component';
import styles from './ward-metrics.scss';

interface WardMetricsProps {
  metrics?: WardMetricType[];
}

const WardMetrics: React.FC<WardMetricsProps> = ({
  metrics = [WardMetricType.PATIENTS, WardMetricType.FREE_BEDS, WardMetricType.TOTAL_BEDS, WardMetricType.PENDING_OUT],
}) => {
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { admissionLocationResponse, inpatientAdmissionResponse, inpatientRequestResponse } =
    wardPatientGroupDetails || {};
  const { isLoading, error } = admissionLocationResponse ?? {};
  const isDataLoading =
    admissionLocationResponse?.isLoading ||
    inpatientAdmissionResponse?.isLoading ||
    inpatientRequestResponse?.isLoading;

  const wardMetricValues = useMemo(
    () => (!wardPatientGroupDetails ? {} : getWardMetrics(wardPatientGroupDetails)),
    [wardPatientGroupDetails],
  );

  if (!wardPatientGroupDetails) return <></>;

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error loading bed details'),
      description: error.message,
    });
  }

  return (
    <div className={styles.metricsContainer}>
      {metrics.includes(WardMetricType.PATIENTS) && (
        <WardMetric
          metricName={getWardMetricNameTranslation('patients', t)}
          metricValue={wardMetricValues['patients'] ?? '--'}
          isLoading={false}
          key={'patients'}
        />
      )}
      {metrics.includes(WardMetricType.FEMALES_OF_REPRODUCTIVE_AGE) &&
        wardMetricValues['femalesOfReproductiveAge'] &&
        wardMetricValues['femalesOfReproductiveAge'] !== '0' && (
          <WardMetric
            metricName={getWardMetricNameTranslation('femalesOfReproductiveAge', t)}
            metricValue={wardMetricValues['femalesOfReproductiveAge'] ?? '--'}
            isLoading={!!isLoading || !!isDataLoading}
            key={'femalesOfReproductiveAge'}
          />
        )}
      {metrics.includes(WardMetricType.NEWBORNS) &&
        wardMetricValues['newborns'] &&
        wardMetricValues['newborns'] !== '0' && (
          <WardMetric
            metricName={getWardMetricNameTranslation('newborns', t)}
            metricValue={wardMetricValues['newborns'] ?? '--'}
            isLoading={!!isLoading || !!isDataLoading}
            key={'newborns'}
          />
        )}
      {isBedManagementModuleInstalled && (
        <>
          {metrics.includes(WardMetricType.FREE_BEDS) && (
            <WardMetric
              metricName={getWardMetricNameTranslation('freeBeds', t)}
              metricValue={wardMetricValues['freeBeds'] ?? '--'}
              isLoading={!!isLoading || !!isDataLoading}
              key={'freeBeds'}
            />
          )}
          {metrics.includes(WardMetricType.TOTAL_BEDS) && (
            <WardMetric
              metricName={getWardMetricNameTranslation('totalBeds', t)}
              metricValue={wardMetricValues['totalBeds'] ?? '--'}
              isLoading={!!isLoading || !!isDataLoading}
              key={'totalBeds'}
            />
          )}
          {metrics.includes(WardMetricType.PENDING_OUT) && (
            <WardMetric
              metricName={getWardMetricNameTranslation('pendingOut', t)}
              metricValue={error ? '--' : (wardPatientGroupDetails?.wardPatientPendingCount?.toString() ?? '--')}
              isLoading={!!isDataLoading}
              key={'pendingOut'}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WardMetrics;
