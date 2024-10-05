import React, { type ReactNode } from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequestsBar from './admission-requests-bar.component';
import useWardLocation from '../hooks/useWardLocation';
import WardMetrics from './ward-metrics.component';

interface WardViewHeaderProps {
  wardPendingPatients: ReactNode;
}

const WardViewHeader: React.FC<WardViewHeaderProps> = ({ wardPendingPatients }) => {
  const { location } = useWardLocation();

  return (
    <div className={styles.wardViewHeader}>
      <h4>{location?.display}</h4>
      <WardMetrics />
      <AdmissionRequestsBar {...{ wardPendingPatients }} />
    </div>
  );
};

export default WardViewHeader;
