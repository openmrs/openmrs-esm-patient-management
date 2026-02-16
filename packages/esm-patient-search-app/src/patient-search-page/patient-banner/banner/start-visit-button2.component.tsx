import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showSnackbar, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

interface StartVisitButtonProps {
  patientUuid: string;
  patient: fhir.Patient;
  startVisitWorkspaceName: string;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
}

/**
 * This button shows up in search results patient cards for patients with no active visit
 */
const StartVisitButton2 = ({
  patientUuid,
  patient,
  startVisitWorkspaceName,
  launchChildWorkspace,
}: StartVisitButtonProps) => {
  const { t } = useTranslation();

  const handleStartVisit = useCallback(async () => {
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
  }, [patientUuid, t, launchChildWorkspace, patient, startVisitWorkspaceName]);

  return (
    <Button aria-label={t('startVisit', 'Start visit')} kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton2;
