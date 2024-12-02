import { Button } from '@carbon/react';
import {
  ArrowRightIcon,
  launchWorkspace,
  showSnackbar,
  useAppContext,
  useFeatureFlag,
  useLayoutType,
} from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../hooks/useWardLocation';
import type { WardPatient, WardPatientWorkspaceProps, WardViewContext } from '../types';
import { useAdmitPatient } from '../ward.resource';

interface AdmissionPatientButtonProps {
  wardPatient: WardPatient;
  onAdmitPatientSuccess();
}

const AdmissionPatientButton: React.FC<AdmissionPatientButtonProps> = ({ wardPatient, onAdmitPatientSuccess }) => {
  const { patient, inpatientRequest, bed } = wardPatient ?? {};
  const dispositionType = inpatientRequest?.dispositionType ?? 'ADMIT';
  const { t } = useTranslation();
  const { location } = useWardLocation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { WardPatientHeader, wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useAdmitPatient();

  const launchPatientAdmissionForm = () =>
    launchWorkspace<WardPatientWorkspaceProps>('admit-patient-form-workspace', { wardPatient, WardPatientHeader });

  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  // If bed management module is installed and the patient does not currently assigned a bed,
  // open the next form for bed selection. If not, admit patient directly
  // (Note that it is possible, albeit an edge case, for a patient to have a bed assigned while not admitted)
  const onAdmit = () => {
    if (isBedManagementModuleInstalled && !bed) {
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
          onAdmitPatientSuccess();
        });
    }
  };

  return (
    <Button
      kind="ghost"
      renderIcon={ArrowRightIcon}
      size={responsiveSize}
      disabled={isLoadingEmrConfiguration || errorFetchingEmrConfiguration}
      onClick={onAdmit}>
      {t('admitPatient', 'Admit patient')}
    </Button>
  );
};

export default AdmissionPatientButton;
