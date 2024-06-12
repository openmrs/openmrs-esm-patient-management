import React from 'react';
import styles from './ward-view-header.scss';
import AdmissionRequests from './admission-requests.component';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface WardViewHeaderProps {
  location: string;
  isLocationInValid: Boolean;
  locationUuidFromUrl: string;
}
const WardViewHeader: React.FC<WardViewHeaderProps> = ({ location, isLocationInValid, locationUuidFromUrl }) => {
  const { t } = useTranslation();
  if (isLocationInValid) {
    return (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('invalidLocationSpecified', 'Invalid location specified')}
        subtitle={t('unknownLocationUuid', 'Unknown location uuid: {{locationUuidFromUrl}}', {
          locationUuidFromUrl,
        })}
      />
    );
  }
  return (
    <div className={styles.wardViewHeader}>
      <h4>{location}</h4>
      <AdmissionRequests />
    </div>
  );
};

export default WardViewHeader;
