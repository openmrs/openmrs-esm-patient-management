import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification, Loading } from '@carbon/react';
import { getCoreTranslation, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import AdmissionRequestCard from './admission-request-card.component';
import styles from './admission-requests-workspace.scss';

const AdmissionRequestsWorkspace: React.FC<DefaultWorkspaceProps> = () => {
  const { t } = useTranslation();
  const { inpatientRequests, isLoading, error } = useInpatientRequest();
  const admissionRequests = inpatientRequests?.filter((request) => request.dispositionType == 'ADMIT');

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title={t('errorLoadingPatientAdmissionRequests', 'Error Loading patient admission requests')}>
        {getCoreTranslation('errorCopy')}
      </InlineNotification>
    );
  }

  return (
    <div className={styles.admissionRequestsWorkspace}>
      {/* TODO: Use a unique key from the admissionRequest object */}
      {admissionRequests.map((admissionRequest, index) => (
        <AdmissionRequestCard key={index} patient={admissionRequest.patient} />
      ))}
    </div>
  );
};

export default AdmissionRequestsWorkspace;
