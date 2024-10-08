import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from '../admission-request-card/admission-request-card.component';
import { Search } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import { type InpatientRequest } from '../../types';

interface AdmissionRequestsWorkspaceProps {}
const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = () => {
  // note: useAppContext() does not work here for some reason, so we call `useInpatientRequest`
  // directly. See: https://openmrs.atlassian.net/browse/O3-4020
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequests,
    error: errorFetchingInpatientRequests,
  } = useInpatientRequest(['ADMIT', 'TRANSFER']);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className={styles.admissionRequestsWorkspaceContainer}>
      <Search
        labelText=""
        value={searchTerm}
        onChange={handleSearch}
        size="lg"
        placeholder={t('searchForPatient', 'Search for a patient')}
        disabled
      />

      <div className={styles.content}>
        {isLoadingInpatientRequests ? (
          <>Loading</>
        ) : errorFetchingInpatientRequests ? (
          <ErrorState
            headerTitle={t('admissionRequests', 'Admission requests')}
            error={errorFetchingInpatientRequests}
          />
        ) : (
          <>
            {inpatientRequests.map((request: InpatientRequest, i) => (
              <AdmissionRequestCard
                key={`admission-request-card-${i}`}
                patient={request.patient}
                visit={request.visit}
                bed={null}
                inpatientRequest={request}
                inpatientAdmission={null}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
