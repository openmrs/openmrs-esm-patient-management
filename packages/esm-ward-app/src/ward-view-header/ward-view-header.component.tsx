import React from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequests from './admission-requests.component';
import { useTranslation } from 'react-i18next';

interface WardViewHeaderProps {
  location: string;
}
const WardViewHeader: React.FC<WardViewHeaderProps> = ({ location }) => {

  return (
    <div className={styles.wardViewHeader}>
      <h4>{location}</h4>
      <AdmissionRequests />
    </div>
  );
};

export default WardViewHeader;
