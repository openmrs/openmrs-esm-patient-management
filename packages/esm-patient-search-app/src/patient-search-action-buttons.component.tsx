import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { launchWorkspace2, showModal, showSnackbar, useVisit } from '@openmrs/esm-framework';
import styles from './patient-search-action-buttons.scss';

interface PatientSearchActionButtonsProps {
  onActionComplete?: () => void;
  patientUuid: string;
  variant?: 'compact' | 'inline';
}

const PatientSearchActionButtons: React.FC<PatientSearchActionButtonsProps> = ({
  onActionComplete,
  patientUuid,
  variant = 'inline',
}) => {
  const { t } = useTranslation();
  const { activeVisit } = useVisit(patientUuid);

  const handleVisitAction = useCallback(() => {
    onActionComplete?.();

    try {
      if (activeVisit) {
        const dispose = showModal('end-visit-dialog', {
          closeModal: () => dispose(),
          patientUuid,
        });
      } else {
        launchWorkspace2('global-start-visit-workspace', {
          openedFrom: 'appointments-check-in',
          patientUuid,
          showPatientHeader: true,
        });
      }
    } catch (error) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: activeVisit
          ? t('errorEndingVisit', 'Error ending visit')
          : t('errorStartingVisit', 'Error starting visit'),
        subtitle:
          error instanceof Error
            ? error.message
            : t('errorLaunchingVisitActionDescription', 'An error occurred while launching the visit action'),
      });
    }
  }, [activeVisit, onActionComplete, patientUuid, t]);

  const handleCreateAppointment = useCallback(() => {
    onActionComplete?.();

    try {
      launchWorkspace2('global-appointments-form-workspace', {}, {}, { patientUuid });
    } catch (error) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorCreatingAppointment', 'Error opening appointment form'),
        subtitle:
          error instanceof Error
            ? error.message
            : t('errorCreatingAppointmentDescription', 'An error occurred while opening the appointment form'),
      });
    }
  }, [onActionComplete, patientUuid, t]);

  const actionsClassName =
    variant === 'compact' ? `${styles.actions} ${styles.compactActions}` : `${styles.actions} ${styles.inlineActions}`;

  return (
    <div className={actionsClassName}>
      <Button
        className={`${styles.actionButton} ${styles.secondaryActionButton}`}
        kind="ghost"
        size="sm"
        onClick={handleVisitAction}>
        {activeVisit ? t('checkOut', 'Check out') : t('checkIn', 'Check In')}
      </Button>
      <Button
        className={`${styles.actionButton} ${styles.primaryActionButton}`}
        kind="primary"
        size="sm"
        onClick={handleCreateAppointment}>
        {t('createAppointment', 'Create appointment')}
      </Button>
    </div>
  );
};

export default PatientSearchActionButtons;
