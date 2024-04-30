import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QueueTableMetricsCard from './queue-table-metrics-card.component';
import styles from '../patient-queue-metrics/clinic-metrics.scss';

function QueueTableMetrics() {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <QueueTableMetricsCard value={'38'} headerLabel={'Total Patients'} />
        <QueueTableMetricsCard value={'3'} headerLabel={'Waiting for Service'} />
        <QueueTableMetricsCard value={'4'} headerLabel={'In Service'} />
        <QueueTableMetricsCard value={'5'} headerLabel={'Waiting for Transfer'} />
      </div>
    </>
  );
}

export default QueueTableMetrics;
