import React from 'react';
import { Movement } from '@carbon/react/icons';
import { Button, InlineNotification } from '@carbon/react';
import { ArrowRightIcon, isDesktop, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../hooks/useWardLocation';
import styles from './admission-requests.scss';

const AdmissionRequestsBar = () => {
  const { inpatientRequests, isLoading, error } = useInpatientRequest(['ADMIT']);
  const { t } = useTranslation();
  const layout = useLayoutType();

  if (isLoading || !inpatientRequests?.length) {
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
          count: inpatientRequests.length,
        })}
      </span>
      <Button
        onClick={() => launchWorkspace('admission-requests-workspace', { inpatientRequests })}
        renderIcon={ArrowRightIcon}
        kind="ghost"
        size={isDesktop(layout) ? 'sm' : 'lg'}>
        {t('manage', 'Manage')}
      </Button>
    </div>
  );
};

export default AdmissionRequestsBar;
