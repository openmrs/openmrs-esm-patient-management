import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './admission-request-card.component';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import useWardLocation from '../hooks/useWardLocation';
import { Loading } from '@carbon/react';
import { InlineNotification } from '@carbon/react';

const AdmissionRequestsWorkspace: React.FC<DefaultWorkspaceProps> = () => {
  const { location } = useWardLocation();
  const { inpatientRequests, isLoading, error } = useInpatientRequest(location?.uuid);
  const admissionRequests = inpatientRequests?.filter((request) => request.dispositionType == 'ADMIT');

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <InlineNotification kind="error" title="Error Loading patient admission requests" />;
  }

  return (
    <div className={styles.admissionRequestsWorkspace}>
      {admissionRequests.map((admissionRequest) => (
        <AdmissionRequestCard patient={admissionRequest.patient} />
      ))}
    </div>
  );
};

export default AdmissionRequestsWorkspace;
