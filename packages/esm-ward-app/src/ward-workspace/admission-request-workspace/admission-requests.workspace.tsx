import { InlineNotification } from '@carbon/react';
import { useAppContext, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React, { createContext, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import styles from './admission-requests-workspace.scss';
import { type WardViewContext } from '../../types';

export interface AdmissionRequestsWorkspaceProps extends DefaultWorkspaceProps {
  wardPendingPatients: ReactNode;
}

export const AdmissionRequestsWorkspaceContext = createContext<AdmissionRequestsWorkspaceProps>(null);

const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = (props) => {
  const { wardPendingPatients } = props;
  const { t } = useTranslation();
  const { errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { inpatientRequests, isLoading, error } = wardPatientGroupDetails?.inpatientRequestResponse ?? {};

  return (
    <div className={styles.admissionRequestsWorkspaceContainer}>
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
      {inpatientRequests?.length == 0 && <div>{t('noPendingPatientRequests', 'No pending patient requests')}</div>}
      <AdmissionRequestsWorkspaceContext.Provider value={props}>
        <div className={styles.content}>{wardPendingPatients}</div>
      </AdmissionRequestsWorkspaceContext.Provider>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
