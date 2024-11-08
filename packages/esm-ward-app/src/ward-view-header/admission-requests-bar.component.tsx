import { Button, InlineNotification } from '@carbon/react';
import { Movement } from '@carbon/react/icons';
import { ArrowRightIcon, isDesktop, launchWorkspace, useAppContext, useLayoutType } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type WardViewContext } from '../types';
import styles from './admission-requests.scss';

interface AdmissionRequestsBarProps {
  wardPendingPatients: ReactNode;
}

const AdmissionRequestsBar: React.FC<AdmissionRequestsBarProps> = ({ wardPendingPatients }) => {
  const {wardPatientGroupDetails} = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { inpatientRequests, isLoading, error } = wardPatientGroupDetails?.inpatientRequestResponse ?? {};
  const { t } = useTranslation();
  const layout = useLayoutType();

  if (isLoading || !inpatientRequests) {
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
    <div className={`${styles.admissionRequestsContainer} ${
      inpatientRequests?.length ? styles.blackBackground : styles.lightBlueBackground
    }`}>
      <Movement className={styles.movementIcon} size="24" />
      <span className={styles.content}>
        {t('admissionRequestsCount', '{{count}} admission request', {
          count: inpatientRequests.length,
        })}
      </span>
      <Button
        onClick={() => launchWorkspace('admission-requests-workspace', { wardPendingPatients })}
        renderIcon={ArrowRightIcon}
        kind="ghost"
        size={isDesktop(layout) ? 'sm' : 'lg'}>
        {t('manage', 'Manage')}
      </Button>
    </div>
  );
};

export default AdmissionRequestsBar;
