import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './send-back-button-toqueue.scss';
import { showModal } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';

interface SendBackPatientActionProps {
  patientUuid: string;
}

const SendBackPatientAction: React.FC<SendBackPatientActionProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const launchModal = () => {
    const dispose = showModal('send-back-patient-to-queue-entry-modal', {
      closeModal: () => dispose(),
      patientUuid,
    });
  };

  return (
    <Button onClick={launchModal} kind="tertiary" className={styles.actionBtn} size="sm">
      {t('addToAQueue', 'Add to a queue')}
    </Button>
  );
};

export default SendBackPatientAction;
