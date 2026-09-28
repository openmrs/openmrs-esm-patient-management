import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, navigate } from '@openmrs/esm-framework';

function getUrlWithoutPrefix(url: string) {
  return url.split(window['getOpenmrsSpaBase']())?.[1];
}

interface BeforeSavePromptProps {
  when: boolean;
  redirect?: string;
}

const BeforeSavePrompt: FC<BeforeSavePromptProps> = ({ when, redirect }) => {
  const { t } = useTranslation();
  const ref = useRef<boolean>(false);
  const [localTarget, setTarget] = useState<string | undefined>();
  const target = localTarget || redirect;
  const cancelUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      const message = t(
        'discardModalBody',
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
      const urlWithoutPrefix = getUrlWithoutPrefix(target);

      // `target` does not necessarily point inside the SPA. It may be a legacy OpenMRS
      // page, either configured via `links.submitButton` or navigated to from within the
      // form. Such a URL has no SPA-relative portion to extract, so pass it through
      // unchanged and let `navigate` choose between single-spa routing and a page load.
      navigate({
        to: typeof urlWithoutPrefix === 'string' ? `\${openmrsSpaBase}/${urlWithoutPrefix}` : target,
      });
    }
  }, [target]);

  return null;
};

export default BeforeSavePrompt;
