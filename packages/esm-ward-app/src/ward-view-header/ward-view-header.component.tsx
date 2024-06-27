import React from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequestsBar from './admission-requests-bar.component';
import { type Location } from '@openmrs/esm-framework';

interface WardViewHeaderProps {
  location: Location;
}
const WardViewHeader: React.FC<WardViewHeaderProps> = ({ location }) => {
  return (
    <div className={styles.wardViewHeader}>
      <h4>{location.display}</h4>
      <AdmissionRequestsBar location={location} />
    </div>
  );
};

export default WardViewHeader;
