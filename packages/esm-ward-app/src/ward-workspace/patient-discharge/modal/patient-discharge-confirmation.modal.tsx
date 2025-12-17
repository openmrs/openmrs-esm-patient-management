import React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './patient-discharge-confirmation.modal.scss';

interface PatientDischargeConfirmationModalProps {
  closeModal: () => void;
  onConfirm: () => void;
}

const PatientDischargeConfirmationModal: React.FC<PatientDischargeConfirmationModalProps> = ({
  closeModal,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <>
      <ModalHeader
        className={styles.sectionTitle}
        closeModal={closeModal}
        title={t('dischargePatient', 'Discharge Patient')}
      />

      <ModalBody className={styles.modalBody}>
        <p>{t('dischargePatientConfirmation', 'Are you sure you want to discharge this patient?')}</p>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'cancel')}
        </Button>

        <Button kind="primary" onClick={handleConfirm}>
          {t('discharge', 'discharge')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default PatientDischargeConfirmationModal;
