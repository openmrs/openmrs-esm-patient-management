import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface CancelPatientEditProps {
  close(): void;
  onConfirm(): void;
}

const CancelPatientEdit: React.FC<CancelPatientEditProps> = ({ close, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('discardModalHeader', 'Confirm Discard Changes')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>
          {t(
            'discardModalBody',
            "The changes you made to this patient's details have not been saved. Discard changes?",
          )}
        </p>
      </div>
      <div className="cds--modal-footer">
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {t('discard', 'Discard')}
        </Button>
      </div>
    </>
  );
};

export default CancelPatientEdit;
