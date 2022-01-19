import React, { useCallback } from 'react';
import styles from './identifier-modal.scss';
import { useTranslation } from 'react-i18next';
import { Button } from 'carbon-components-react';

interface DeleteIdentifierConfirmationModalProps {
  closeModal: () => void;
  deleteIdentifier: () => void;
  identifierName: string;
  identifierValue: string;
}

const DeleteIdentifierConfirmationModal: React.FC<DeleteIdentifierConfirmationModalProps> = ({
  closeModal,
  deleteIdentifier,
  identifierName,
  identifierValue,
}) => {
  const { t } = useTranslation();
  const handleDeleteIdentifier = useCallback(() => {
    deleteIdentifier();
    closeModal();
  }, []);

  return (
    <div className={styles.modalContent}>
      <h1 className={styles.productiveHeading03}>{t('deleteIdentifierModalHeading', 'Remove identifier?')}</h1>
      <h3 className={styles.modalBody}>
        {identifierName}
        {t(
          'deleteIdentifierModalText',
          ' identifier for this patient already contains the following information: ',
        )}{' '}
        {identifierValue}
      </h3>
      <div className={styles.buttonSet}>
        <Button kind="secondary" size="lg" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" size="lg" onClick={handleDeleteIdentifier}>
          {t('removeIdentifierButton', 'Remove Identifier')}
        </Button>
      </div>
    </div>
  );
};

export default DeleteIdentifierConfirmationModal;
