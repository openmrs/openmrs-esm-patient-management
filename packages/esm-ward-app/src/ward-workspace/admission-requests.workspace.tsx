import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './admission-request-card.component';
import { Search } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useInpatientRequest } from '../hooks/useInpatientRequest';

interface AdmissionRequestsWorkspaceProps {}
const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = () => {
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequests,
    error: errorFetchingInpatientRequests,
  } = useInpatientRequest();
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
            {inpatientRequests.map((request, indx) => (
              <AdmissionRequestCard key={indx} patient={request.patient} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
