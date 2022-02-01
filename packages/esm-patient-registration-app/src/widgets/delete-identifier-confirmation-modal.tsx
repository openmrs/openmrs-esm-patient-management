import React, { useCallback } from 'react';
import styles from './delete-identifier-modal.scss';
import { useTranslation } from 'react-i18next';
import { Button } from 'carbon-components-react';

interface DeleteIdentifierConfirmationModalProps {
  deleteIdentifier: (x: boolean) => void;
  identifierName: string;
  identifierValue: string;
}

const DeleteIdentifierConfirmationModal: React.FC<DeleteIdentifierConfirmationModalProps> = ({
  deleteIdentifier,
  identifierName,
  identifierValue,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.modalContent}>
      <h1 className={styles.productiveHeading}>{t('deleteIdentifierModalHeading', 'Remove identifier?')}</h1>
      <h3 className={styles.modalSubtitle}>
        {identifierName}
        {t('deleteIdentifierModalText', ' has a value of ')} {identifierValue}
      </h3>
      <p className={styles.modalBody}>
        {t('confirmIdentifierDeletionText', 'Are you sure you want to remove this identifier?')}
      </p>
      <div className={styles.buttonSet}>
        <Button kind="secondary" size="lg" onClick={() => deleteIdentifier(false)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" size="lg" onClick={() => deleteIdentifier(true)}>
          {t('removeIdentifierButton', 'Remove Identifier')}
        </Button>
      </div>
    </div>
  );
};

export default DeleteIdentifierConfirmationModal;
