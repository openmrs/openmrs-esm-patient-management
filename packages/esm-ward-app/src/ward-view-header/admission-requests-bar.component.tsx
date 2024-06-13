import React from 'react';
import { Movement } from '@carbon/react/icons';
import styles from './admission-requests.scss';
import { launchWorkspace, showNotification } from '@openmrs/esm-framework';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { useParams } from 'react-router-dom';
import { ButtonSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';

const AdmissionRequestsBar = () => {
  const { locationUuid } = useParams();
  const { inpatientRequests, isLoading, error } = useInpatientRequest(locationUuid);
  const admissionRequests = inpatientRequests?.filter((request) => request.type == 'ADMISSION');
  const { t } = useTranslation();

  if (isLoading) {
    return <ButtonSkeleton />;
  }

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingPatientAdmissionRequests', 'Error Loading Patient Admission Requests'),
      description: error.message,
    });
    return <></>;
  }

  return admissionRequests.length > 0 ? (
    <div className={styles.admissionRequestsContainer}>
      <Movement className={styles.movementIcon} size="24" />
      <span className={styles.content}>{admissionRequests.length} admission requests</span>
      <button
        className={styles.manageButton}
        onClick={() => launchWorkspace('admission-requests-cards', { admissionRequests })}>
        Manage
      </button>
    </div>
  ) : (
    <></>
  );
};

export default AdmissionRequestsBar;
