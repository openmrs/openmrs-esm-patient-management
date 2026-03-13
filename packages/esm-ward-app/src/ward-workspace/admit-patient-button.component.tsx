import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import {
  ArrowRightIcon,
  showSnackbar,
  useAppContext,
  useFeatureFlag,
  useLayoutType,
  useWorkspace2Context,
} from '@openmrs/esm-framework';
import useWardLocation from '../hooks/useWardLocation';
import type { DispositionType, WardPatient, WardViewContext } from '../types';
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
  const [isAdmitting, setIsAdmitting] = useState(false);
  const { launchChildWorkspace } = useWorkspace2Context();

  const launchPatientAdmissionForm = () => launchChildWorkspace('admit-patient-form-workspace', { wardPatient });

  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  // If bed management module is installed and the patient is not currently assigned a bed,
  // open the next form for bed selection. If not, admit patient directly
  // (Note that it is possible, albeit an edge case, for a patient to have a bed assigned while not admitted)
  const onAdmit = async () => {
    if (isBedManagementModuleInstalled && !bed) {
      launchPatientAdmissionForm();
    } else {
      setIsAdmitting(true);
      try {
        const response = await admitPatient(patient, dispositionType, visit.uuid);
        await wardPatientGroupDetails?.mutate?.();
        if (response && response?.ok) {
          showSnackbar({
            kind: 'success',
            title:
              dispositionType === 'ADMIT'
                ? t('patientAdmittedSuccessfully', 'Patient admitted successfully')
                : t('patientTransferredSuccessfully', 'Patient transferred successfully'),
            subtitle:
              dispositionType === 'ADMIT'
                ? t('patientAdmittedToLocation', 'Patient admitted successfully to {{location}}', {
                    location: location?.display,
                  })
                : t('patientTransferredToLocation', 'Patient transferred successfully to {{location}}', {
                    location: location?.display,
                  }),
          });
        }
        onAdmitPatientSuccess();
      } catch (err) {
        // TODO: better way to handle / display error messages
        // https://openmrs.atlassian.net/browse/O3-5423
        const errorMessage =
          err?.responseBody?.error?.globalErrors?.[0]?.message ??
          err.message ??
          t('unknownError', 'An unknown error occurred');
        showSnackbar({
          kind: 'error',
          title:
            dispositionType === 'ADMIT'
              ? t('errrorAdmitingPatient', 'Failed to admit patient')
              : t('errorTransferringPatient', 'Failed to transfer patient'),
          subtitle: errorMessage,
        });
      } finally {
        setIsAdmitting(false);
      }
    }
  };

  const disabledButton = isLoadingEmrConfiguration || errorFetchingEmrConfiguration || disabled || isAdmitting;
  return (
    <Button kind="ghost" renderIcon={ArrowRightIcon} size={responsiveSize} disabled={disabledButton} onClick={onAdmit}>
      {dispositionType === 'ADMIT' || disabledButton
        ? t('admitPatient', 'Admit patient')
        : t('transferPatient', 'Transfer patient')}
    </Button>
  );
};

export default AdmitPatientButton;
