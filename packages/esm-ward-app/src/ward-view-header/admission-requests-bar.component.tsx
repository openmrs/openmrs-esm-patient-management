import { Button, InlineNotification } from '@carbon/react';
import { Movement } from '@carbon/react/icons';
import { ArrowRightIcon, isDesktop, launchWorkspace, useAppContext, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatientGroupDetails } from '../types';
import styles from './admission-requests.scss';

const AdmissionRequestsBar = () => {
  const wardPatientGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { inpatientRequests, isLoading, error } = wardPatientGrouping?.inpatientRequestResponse ?? {};
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
        title={t('errorLoadingPatientAdmissionRequests', 'Error loading patient admission requests')}
      />
    );
  }

  return (
    <div className={styles.admissionRequestsContainer}>
      <Movement className={styles.movementIcon} size="24" />
      <span className={styles.content}>
        {t('admissionRequestsCount', '{{count}} admission request', {
          count: inpatientRequests.length,
        })}
      </span>
      <Button
        onClick={() => launchWorkspace('admission-requests-workspace')}
        renderIcon={ArrowRightIcon}
        kind="ghost"
        size={isDesktop(layout) ? 'sm' : 'lg'}>
        {t('manage', 'Manage')}
      </Button>
    </div>
  );
};

export default AdmissionRequestsBar;
