import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { useAppContext, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type WardViewContext } from '../../types';
import AdmissionRequestsEmptyState from './admission-requests-empty-state.component';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import styles from './admission-requests-workspace.scss';

export interface AdmissionRequestsWorkspaceProps {
  wardPendingPatients: ReactNode;
}

const AdmissionRequestsWorkspace: React.FC<Workspace2DefinitionProps<AdmissionRequestsWorkspaceProps>> = ({
  workspaceProps: { wardPendingPatients },
}) => {
  const { t } = useTranslation();
  const { errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { inpatientRequests, isLoading } = wardPatientGroupDetails?.inpatientRequestResponse ?? {};

  return (
    <Workspace2 title={t('admissionRequests', 'Admission requests')}>
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
        {inpatientRequests?.length === 0 && !isLoading && <AdmissionRequestsEmptyState />}
        <div className={styles.content}>{wardPendingPatients}</div>
      </div>
    </Workspace2>
  );
};

export default AdmissionRequestsWorkspace;
