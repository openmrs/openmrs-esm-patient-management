import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './components/admission-request-card.component';
import { Search } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { InpatientRequest } from '../types';

interface AdmissionRequestsWorkspaceProps {}
const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = () => {
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
              <AdmissionRequestCard key={`admission-request-card-${i}`}
                patient={request.patient}
                visit={request.visit}
                disposition={request.disposition}
                dispositionEncounter={request.dispositionEncounter}
                dispositionType={request.dispositionType} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
