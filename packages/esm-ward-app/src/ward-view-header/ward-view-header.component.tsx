import React, { type ReactNode } from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequestsBar from './admission-requests-bar.component';
import useWardLocation from '../hooks/useWardLocation';

interface WardViewHeaderProps {
  wardPendingPatients: ReactNode;
  wardMetrics: ReactNode;
  locationAllowsAdmissions?: boolean;
}

const WardViewHeader: React.FC<WardViewHeaderProps> = ({
  wardPendingPatients,
  wardMetrics,
  locationAllowsAdmissions,
}) => {
  const { location } = useWardLocation();

  return (
    <div className={styles.wardViewHeader}>
      <h2>{location?.display}</h2>
      {wardMetrics}
      <AdmissionRequestsBar locationAllowsAdmissions={locationAllowsAdmissions} {...{ wardPendingPatients }} />
    </div>
  );
};

export default WardViewHeader;
