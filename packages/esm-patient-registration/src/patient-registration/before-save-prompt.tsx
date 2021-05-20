import React, { useEffect } from 'react';
import Modal from 'carbon-components-react/es/components/Modal';
import { useTranslation } from 'react-i18next';

const noop = () => {};

interface BeforeSavePromptProps {
  when: boolean;
  open: boolean;
  cancelNavFn: EventListener;
  onRequestClose: Function;
  onRequestSubmit: Function;
}

const BeforeSavePrompt: React.FC<BeforeSavePromptProps> = ({
  when,
  open,
  cancelNavFn,
  onRequestClose,
  onRequestSubmit,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (when) {
      window.addEventListener('single-spa:before-routing-event', cancelNavFn);
      window.onbeforeunload = () => {
        return 'do you want to leave?';
      };
    }

    return () => {
      window.onbeforeunload = noop;
      window.removeEventListener('single-spa:before-routing-event', cancelNavFn);
    };
  }, [when, cancelNavFn]);

  return (
    <Modal
      {...{
        open,
        danger: true,
        size: 'sm',
        modalHeading: t('discardModalHeader', 'Confirm Discard Changes'),
        primaryButtonText: t('discard'),
        secondaryButtonText: t('cancel'),
        onRequestClose,
        onRequestSubmit,
      }}>
      {t('discardModalBody', "The changes you made to this patient's details have not been saved. Discard changes?")}
    </Modal>
  );
};

export default BeforeSavePrompt;
