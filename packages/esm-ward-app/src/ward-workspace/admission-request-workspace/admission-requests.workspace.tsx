import { InlineNotification, Search } from '@carbon/react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React, { createContext, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import styles from './admission-requests-workspace.scss';

export interface AdmissionRequestsWorkspaceProps extends DefaultWorkspaceProps {
  wardPendingPatients: ReactNode;
}

export const AdmissionRequestsWorkspaceContext = createContext<AdmissionRequestsWorkspaceProps>(null);

const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = (props) => {
  const { wardPendingPatients } = props;
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const { errorFetchingEmrConfiguration } = useEmrConfiguration();

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
      {errorFetchingEmrConfiguration && (
        <div className={styles.formError}>
          <InlineNotification
            kind="error"
            title={t('somePartsOfTheFormDidntLoad', "Some parts of the form didn't load")}
            subtitle={t(
              'fetchingEmrConfigurationFailed',
              'Fetching EMR configuration failed. Try refreshing the page or contact your system administrator.',
            )}
            lowContrast
            hideCloseButton
          />
        </div>
      )}
      <AdmissionRequestsWorkspaceContext.Provider value={props}>
        <div className={styles.content}>{wardPendingPatients}</div>
      </AdmissionRequestsWorkspaceContext.Provider>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
