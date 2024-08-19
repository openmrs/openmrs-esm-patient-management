import React from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequestsBar from './admission-requests-bar.component';
import useWardLocation from '../hooks/useWardLocation';

interface WardViewHeaderProps {}

const WardViewHeader: React.FC<WardViewHeaderProps> = () => {
  const { location } = useWardLocation();
  return (
    <div className={styles.wardViewHeader}>
      <h4>{location?.display}</h4>
      <AdmissionRequestsBar />
    </div>
  );
};

export default WardViewHeader;
