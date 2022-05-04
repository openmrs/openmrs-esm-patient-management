import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { navigate, showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

function getUrlWithoutPrefix(url: string) {
  return url.split(window['getOpenmrsSpaBase']())?.[1];
}

interface BeforeSavePromptProps {
  when: boolean;
  redirect?: string;
}

const BeforeSavePrompt: React.FC<BeforeSavePromptProps> = ({ when, redirect }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const ref = useRef(false);
  const [localTarget, setTarget] = useState<string | undefined>();
  const target = localTarget || redirect;
  const cancelUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      const message = t(
        'discardPatientDetails',
        "The changes you made to this patient's details have not been saved. Discard changes?",
      );
      e.preventDefault();
      e.returnValue = message;
      return message;
    },
    [t],
  );

  const cancelNavigation = useCallback((evt: CustomEvent) => {
    if (!evt.detail.navigationIsCanceled && !ref.current) {
      ref.current = true;
      evt.detail.cancelNavigation();
      const dispose = showModal(
        'cancel-patient-edit-modal',
        {
          onConfirm: () => {
            setTarget(evt.detail.newUrl);
            dispose();
          },
        },
        () => {
          ref.current = false;
        },
      );
    }
  }, []);

  useEffect(() => {
    if (when && typeof target === 'undefined') {
      window.addEventListener('single-spa:before-routing-event', cancelNavigation);
      window.addEventListener('beforeunload', cancelUnload);

      return () => {
        window.removeEventListener('beforeunload', cancelUnload);
        window.removeEventListener('single-spa:before-routing-event', cancelNavigation);
      };
    }
  }, [target, when, cancelUnload, cancelNavigation]);

  useEffect(() => {
    if (typeof target === 'string') {
      navigate({ to: `/${getUrlWithoutPrefix(target)}` });
    }
  }, [target]);

  return null;
};

export default BeforeSavePrompt;
