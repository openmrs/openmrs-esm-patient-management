import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button } from '@carbon/react';
import styles from './start-visit-confirmation.scss';

interface StartVisitConfirmationModalProps {
  closeModal: () => void;
  startVisit: () => void;
  patientName: string;
}

const StartVisitConfirmationModal: React.FC<StartVisitConfirmationModalProps> = ({
  closeModal,
  startVisit,
  patientName,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      open
      danger
      modalHeading={t('startVisitModalHeading', 'Start Visit?')}
      primaryButtonText={t('startVisitButton', 'Start Visit')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestClose={closeModal}
      onRequestSubmit={startVisit}>
      <p>
        {t(
          'startVisitMessage',
          'You must start a visit for {{name}} before adding them to the Queue list. Do you want to start a visit now?',
          { name: patientName },
        )}
      </p>
    </Modal>
  );
};

export default StartVisitConfirmationModal;
