import { showNotification, useAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WardViewContext } from '../../types';
import { getWardMetricNameTranslation, getWardMetrics } from '../ward-view.resource';
import WardMetric from '../../ward-view-header/ward-metric.component';
import styles from '../ward-metrics.scss';

const DefaultWardMetrics = () => {
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
  if (!wardPatientGroupDetails) return <></>;

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error loading bed details'),
      description: error.message,
    });
  }

  const wardMetricValues = getWardMetrics(wardPatientGroupDetails);
  return (
    <div className={styles.metricsContainer}>
      <WardMetric
        metricName={getWardMetricNameTranslation('patients', t)}
        metricValue={wardMetricValues['patients']}
        isLoading={false}
        key={'patients'}
      />
      {isBedManagementModuleInstalled && (
        <>
          <WardMetric
            metricName={getWardMetricNameTranslation('freeBeds', t)}
            metricValue={wardMetricValues['freeBeds']}
            isLoading={!!isLoading || !!isDataLoading}
            key={'freeBeds'}
          />
          <WardMetric
            metricName={getWardMetricNameTranslation('totalBeds', t)}
            metricValue={wardMetricValues['totalBeds']}
            isLoading={!!isLoading || !!isDataLoading}
            key={'totalBeds'}
          />
          <WardMetric
            metricName={getWardMetricNameTranslation('pendingOut', t)}
            metricValue={wardPatientGroupDetails?.wardPatientPendingCount?.toString()}
            isLoading={!!isDataLoading}
            key="pending"
          />
        </>
      )}
    </div>
  );
};

export default DefaultWardMetrics;
