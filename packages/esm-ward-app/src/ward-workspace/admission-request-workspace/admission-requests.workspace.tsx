import { Search } from '@carbon/react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './admission-requests-workspace.scss';

export interface AdmissionRequestsWorkspaceProps extends DefaultWorkspaceProps {
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
