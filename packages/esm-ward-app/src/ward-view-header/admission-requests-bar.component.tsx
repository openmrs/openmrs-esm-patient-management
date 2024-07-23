import React from 'react';
import { Movement } from '@carbon/react/icons';
import { Button, InlineNotification } from '@carbon/react';
import { ArrowRightIcon, isDesktop, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../hooks/useWardLocation';
import styles from './admission-requests.scss';

const AdmissionRequestsBar = () => {
  const { location } = useWardLocation();
  const { inpatientRequests, isLoading, error } = useInpatientRequest(location?.uuid);
  const admissionRequests = inpatientRequests?.filter((request) => request.dispositionType == 'ADMIT');
  const { t } = useTranslation();
  const layout = useLayoutType();

  if (isLoading || !admissionRequests?.length) {
    return null;
  }

  if (error) {
    console.error(error);
    return (
      <InlineNotification
        kind="error"
        title={t('errorLoadingPatientAdmissionRequests', 'Error Loading patient admission requests')}
      />
    );
  }

  return (
    <div className={styles.admissionRequestsContainer}>
      <Movement className={styles.movementIcon} size="24" />
      <span className={styles.content}>
        {t('admissionRequestsCount', '{{count}} admission requests', {
          count: admissionRequests.length,
        })}
      </span>
      <Button
        onClick={() => launchWorkspace('admission-requests-workspace', { admissionRequests })}
        renderIcon={ArrowRightIcon}
        kind="ghost"
        size={isDesktop(layout) ? 'sm' : 'lg'}>
        {t('manage', 'Manage')}
      </Button>
    </div>
  );
};

export default AdmissionRequestsBar;
