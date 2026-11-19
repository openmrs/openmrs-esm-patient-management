import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showSnackbar, type Visit } from '@openmrs/esm-framework';
import { type LaunchStartVisitWorkspace } from '../../../patient-search-context';

interface StartVisitButtonProps {
  patientUuid: string;
  patient: fhir.Patient;
  /**
   * Launches the start visit workspace with the given workspace props. The caller decides which workspace
   * that is, and whether it opens as a child workspace or a top-level one.
   */
  launchStartVisitWorkspace: LaunchStartVisitWorkspace;
  /**
   * An optional function invoked by the visit form workspace after the visit is
   * successfully started.
   */
  onVisitStarted?: (visit: Visit) => void;
}

/**
 * This button shows up in search results patient cards for patients with no active visit
 */
const StartVisitButton2 = ({
  patientUuid,
  patient,
  launchStartVisitWorkspace,
  onVisitStarted,
}: StartVisitButtonProps) => {
  const { t } = useTranslation();

  const handleStartVisit = useCallback(async () => {
    try {
      await launchStartVisitWorkspace({
        openedFrom: 'patient-search-results',
        patient,
        patientUuid,
        onVisitStarted,
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
  }, [patientUuid, t, launchStartVisitWorkspace, patient, onVisitStarted]);

  return (
    <Button aria-label={t('startVisit', 'Start visit')} kind="primary" onClick={handleStartVisit}>
      {t('startVisit', 'Start visit')}
    </Button>
  );
};

export default StartVisitButton2;
