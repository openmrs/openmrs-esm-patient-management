import React from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequestsBar from './admission-requests-bar.component';

interface WardViewHeaderProps {
  location: string;
}
const WardViewHeader: React.FC<WardViewHeaderProps> = ({ location }) => {
  return (
    <div className={styles.wardViewHeader}>
      <h4>{location}</h4>
      <AdmissionRequestsBar />
    </div>
  );
};

export default WardViewHeader;
