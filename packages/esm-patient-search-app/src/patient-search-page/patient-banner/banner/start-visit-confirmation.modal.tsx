import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { launchWorkspace, showSnackbar } from '@openmrs/esm-framework';
import styles from './start-visit-confirmation.scss';

interface StartVisitConfirmationModalProps {
  closeModal: () => void;
  patientName: string;
  patientUuid: string;
}

const StartVisitConfirmationModal: React.FC<StartVisitConfirmationModalProps> = ({
  closeModal,
  patientName,
  patientUuid,
}) => {
  const { t } = useTranslation();

  const handleStartVisit = useCallback(() => {
    try {
      launchWorkspace('start-visit-workspace-form', {
        patientUuid: patientUuid,
        showPatientHeader: true,
        openedFrom: 'service-queues-add-patient',
      });
    } catch (error) {
      console.error('Error launching visit form workspace:', error);

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorStartingVisit', 'Error starting visit'),
        subtitle: error.message ?? t('errorStartingVisitDescription', 'An error occurred while starting the visit'),
      });
    } finally {
      closeModal();
    }
  }, [patientUuid, t, closeModal]);

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('startVisitQuestion', 'Start visit?')}
      />
      <ModalBody>
        <p>
          {t(
            'startVisitPrompt',
            'You must start a visit for {{name}} before adding them to the Active visits list. Do you want to start a visit now?',
            { name: patientName },
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleStartVisit}>
          {t('startVisit', 'Start visit')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default StartVisitConfirmationModal;
