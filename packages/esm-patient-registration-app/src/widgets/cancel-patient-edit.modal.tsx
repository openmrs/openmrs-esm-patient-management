import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import styles from './cancel-patient-edit.scss';

interface CancelPatientEditPropsModal {
  close(): void;
  onConfirm(): void;
}

const CancelPatientEditModal: React.FC<CancelPatientEditPropsModal> = ({ close, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={close}
        title={t('confirmDiscardChangesTitle', 'Are you sure you want to discard these changes?')}
      />
      <ModalBody>
        <p>{t('confirmDiscardChangesBody', 'Your unsaved changes will be lost if you proceed to discard the form')}.</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {t('discard', 'Discard')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default CancelPatientEditModal;
