import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { useAppContext } from '@openmrs/esm-framework';
import { type WardViewContext } from '../../types';
import {
  AdmissionRequestsWorkspaceContextProvider,
  type AdmissionRequestsWorkspaceContextProps,
} from './admission-requests-context';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import styles from './admission-requests-workspace.scss';

const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceContextProps> = ({ wardPendingPatients }) => {
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
      <AdmissionRequestsWorkspaceContextProvider
        value={{ wardPendingPatients } as unknown as AdmissionRequestsWorkspaceContextProps}>
        <div className={styles.content}>{wardPendingPatients}</div>
      </AdmissionRequestsWorkspaceContextProvider>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
