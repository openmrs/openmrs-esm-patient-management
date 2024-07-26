import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './admission-request-card.component';
import { getCoreTranslation, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import useWardLocation from '../hooks/useWardLocation';
import { Loading } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';

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
      {admissionRequests.map((admissionRequest, indx) => (
        <AdmissionRequestCard key={indx} patient={admissionRequest.patient} />
      ))}
    </div>
  );
};

export default AdmissionRequestsWorkspace;
