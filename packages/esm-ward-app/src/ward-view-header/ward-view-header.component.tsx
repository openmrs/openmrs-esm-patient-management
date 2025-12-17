import React, { type ReactNode } from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequestsBar from './admission-requests-bar.component';
import useWardLocation from '../hooks/useWardLocation';

interface WardViewHeaderProps {
  wardPendingPatients: ReactNode;
  wardMetrics: ReactNode;
}

const WardViewHeader: React.FC<WardViewHeaderProps> = ({ wardPendingPatients, wardMetrics }) => {
  const { location } = useWardLocation();

  return (
    <div className={styles.wardViewHeader}>
      <h4>{location?.display}</h4>
      {wardMetrics}
      <AdmissionRequestsBar {...{ wardPendingPatients }} />
    </div>
  );
};

export default WardViewHeader;
