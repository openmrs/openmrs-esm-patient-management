import React, { type ReactNode } from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from '../admission-request-card/admission-request-card.component';
import { Search } from '@carbon/react';
import { type DefaultWorkspaceProps, ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import { type InpatientRequest } from '../../types';

interface AdmissionRequestsWorkspaceProps extends DefaultWorkspaceProps {
  wardPendingPatients: ReactNode;
}
const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = ({ wardPendingPatients }) => {
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

      <div className={styles.content}>{wardPendingPatients}</div>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
