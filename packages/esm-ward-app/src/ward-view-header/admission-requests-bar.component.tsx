import { SkeletonIcon } from '@carbon/react';
import { Movement } from '@carbon/react/icons';
import { launchWorkspace, showNotification, type Location } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import styles from './admission-requests.scss';

interface AdmissionRequestsBarProps {
  location: Location;
}

const AdmissionRequestsBar: React.FC<AdmissionRequestsBarProps> = ({ location }) => {
  const { inpatientRequests, isLoading, error } = useInpatientRequest(location.uuid);
  const admissionRequests = inpatientRequests?.filter((request) => request.type == 'ADMISSION');
  const { t } = useTranslation();

  if (isLoading) {
    return <SkeletonIcon className={styles.skeleton} />;
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
