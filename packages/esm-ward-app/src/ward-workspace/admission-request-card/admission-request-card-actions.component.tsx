import { Button } from '@carbon/react';
import {
  ArrowRightIcon,
  launchWorkspace,
  showSnackbar,
  useAppContext,
  useFeatureFlag,
  useLayoutType,
} from '@openmrs/esm-framework';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../../hooks/useWardLocation';
import type { WardPatientCardType, WardPatientWorkspaceProps, WardViewContext } from '../../types';
import { useAdmitPatient } from '../../ward.resource';
import { AdmissionRequestsWorkspaceContext } from '../admission-request-workspace/admission-requests.workspace';
import styles from './admission-request-card.scss';

const AdmissionRequestCardActions: WardPatientCardType = (wardPatient) => {
  const { patient, inpatientRequest } = wardPatient;
  const { dispositionType } = inpatientRequest;
  const { t } = useTranslation();
  const { location } = useWardLocation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { WardPatientHeader, wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useAdmitPatient();

  const launchPatientAdmissionForm = () =>
    launchWorkspace<WardPatientWorkspaceProps>('admit-patient-form-workspace', { wardPatient, WardPatientHeader });

  const launchPatientTransferForm = useCallback(() => {
    launchWorkspace<WardPatientWorkspaceProps>('patient-transfer-request-workspace', {
      wardPatient,
      WardPatientHeader,
    });
  }, [wardPatient, WardPatientHeader]);
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const { closeWorkspaceWithSavedChanges } = useContext(AdmissionRequestsWorkspaceContext);

  // If bed management module is installed, open the next form
  // for bed selection. If not, admit patient directly
  const onAdmit = () => {
    if (isBedManagementModuleInstalled) {
      launchPatientAdmissionForm();
    } else {
      admitPatient(patient, dispositionType)
        .then(
          (response) => {
            if (response && response?.ok) {
              showSnackbar({
                kind: 'success',
                title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
                subtitle: t('patientAdmittedWoBed', 'Patient admitted successfully to {{location}}', {
                  location: location?.display,
                }),
              });
            }
          },
          (err: Error) => {
            showSnackbar({
              kind: 'error',
              title: t('errorCreatingEncounter', 'Failed to admit patient'),
              subtitle: err.message,
            });
          },
        )
        .finally(() => {
          wardPatientGroupDetails?.mutate?.();
          closeWorkspaceWithSavedChanges();
        });
    }
  };

  return (
    <div className={styles.admissionRequestActionBar}>
      <Button kind="ghost" size={responsiveSize} onClick={launchPatientTransferForm}>
        {t('transferElsewhere', 'Transfer elsewhere')}
      </Button>
      <Button
        kind="ghost"
        renderIcon={ArrowRightIcon}
        size={responsiveSize}
        disabled={isLoadingEmrConfiguration || errorFetchingEmrConfiguration}
        onClick={onAdmit}>
        {t('admitPatient', 'Admit patient')}
      </Button>
    </div>
  );
};

export default AdmissionRequestCardActions;
