import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showSnackbar, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

interface StartVisitButtonProps {
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  onPatientSelected?: (
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
    closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
  ) => void;
  patientUuid: string;
  patient: fhir.Patient;
  primaryActionLabel?: string;
  primaryActionMode?: 'startVisit' | 'selectPatient';
  startVisitWorkspaceName: string;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
}

/**
 * This button shows up in search results patient cards for patients with no active visit
 */
const StartVisitButton2 = ({
  closeWorkspace,
  onPatientSelected,
  patientUuid,
  patient,
  primaryActionLabel,
  primaryActionMode = 'startVisit',
  startVisitWorkspaceName,
  launchChildWorkspace,
}: StartVisitButtonProps) => {
  const { t } = useTranslation();
  const buttonLabel = primaryActionLabel ?? t('startVisit', 'Start visit');

  const handleStartVisit = useCallback(async () => {
    if (primaryActionMode === 'selectPatient' && onPatientSelected) {
      onPatientSelected(patientUuid, patient, launchChildWorkspace, closeWorkspace);
      return;
    }

    try {
      await launchChildWorkspace(startVisitWorkspaceName, {
        openedFrom: 'patient-search-results',
        patient,
        patientUuid,
      });
    } catch (error) {
      console.error('Error launching visit form workspace:', error);

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorStartingVisit', 'Error starting visit'),
        subtitle: error.message ?? t('errorStartingVisitDescription', 'An error occurred while starting the visit'),
      });
    }
  }, [
    closeWorkspace,
    launchChildWorkspace,
    onPatientSelected,
    patient,
    patientUuid,
    primaryActionMode,
    startVisitWorkspaceName,
    t,
  ]);

  return (
    <Button aria-label={buttonLabel} kind="primary" onClick={handleStartVisit}>
      {buttonLabel}
    </Button>
  );
};

export default StartVisitButton2;
