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
import type { DispositionType, WardPatient, WardPatientWorkspaceProps, WardViewContext } from '../types';
import { useAdmitPatient } from '../ward.resource';

interface AdmitPatientButtonProps {
  wardPatient: WardPatient;

  /**
   * whether to create an admit or transfer encounter for the given patient
   */
  dispositionType: DispositionType;
  onAdmitPatientSuccess();
  disabled?: boolean;
}

const AdmitPatientButton: React.FC<AdmitPatientButtonProps> = ({
  wardPatient,
  onAdmitPatientSuccess,
  disabled,
  dispositionType,
}) => {
  const { patient, visit, bed } = wardPatient ?? {};
  const { t } = useTranslation();
  const { location } = useWardLocation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useAdmitPatient();

  const launchPatientAdmissionForm = () =>
    launchWorkspace<WardPatientWorkspaceProps>('admit-patient-form-workspace', { wardPatient });

  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  // If bed management module is installed and the patient is not currently assigned a bed,
  // open the next form for bed selection. If not, admit patient directly
  // (Note that it is possible, albeit an edge case, for a patient to have a bed assigned while not admitted)
  const onAdmit = () => {
    if (isBedManagementModuleInstalled && !bed) {
      launchPatientAdmissionForm();
    } else {
      admitPatient(patient, dispositionType, visit.uuid)
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

  const disabledButton = isLoadingEmrConfiguration || errorFetchingEmrConfiguration || disabled;
  return (
    <Button kind="ghost" renderIcon={ArrowRightIcon} size={responsiveSize} disabled={disabledButton} onClick={onAdmit}>
      {dispositionType == 'ADMIT' || disabledButton
        ? t('admitPatient', 'Admit patient')
        : t('transferPatient', 'Transfer patient')}
    </Button>
  );
};

export default AdmitPatientButton;
