import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';

interface AppointmentMetricsProps {
  appointmentServiceTypes: Array<string>;
}

const AppointmentsMetrics: React.FC<AppointmentMetricsProps> = ({ appointmentServiceTypes }) => {
  return (
    <>
      <MetricsHeader />
      <ExtensionSlot name="appointments-metrics-slot" className={styles.cardContainer} />
    </>
  );
};

export default AppointmentsMetrics;
