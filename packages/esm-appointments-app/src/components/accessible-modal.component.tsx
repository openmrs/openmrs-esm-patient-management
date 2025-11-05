import React, { useEffect, useRef } from 'react';
import { ComposedModal } from '@carbon/react';

export interface AccessibleModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback fired when modal should close */
  onClose: () => void;
  /** ID of the element that labels the modal (for aria-labelledby) */
  modalHeadingId?: string;
  /** ID of the element that describes the modal (for aria-describedby) */
  modalDescriptionId?: string;
  /** Optional CSS selector for initial focus element */
  selectorPrimaryFocus?: string;
  /** Children to render inside the modal */
  children: React.ReactNode;
}

/**
 * AccessibleModal wraps Carbon's ComposedModal with WCAG 2.1 AA compliance.
 *
 * Carbon's ComposedModal already provides:
 * - Built-in focus trapping (via focusTrap prop, enabled by default)
 * - ESC key handling
 * - ARIA attributes (role="dialog", aria-modal="true")
 * - Initial focus management (via selectorPrimaryFocus)
 *
 * This wrapper simply adds:
 * - Consistent API for OpenMRS modals
 * - Focus restoration to trigger element
 * - Proper ARIA labeling
 *
 * @param {AccessibleModalProps} props
 * @returns {JSX.Element | null}
 */
const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  modalHeadingId,
  modalDescriptionId,
  selectorPrimaryFocus,
  children,
  ...rest
}) => {
  // Store the element that opened the modal to restore focus on close
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the triggering element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else if (previousActiveElement.current) {
      // Restore focus when modal closes
      setTimeout(() => {
        previousActiveElement.current?.focus();
        previousActiveElement.current = null;
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <ComposedModal
      open={isOpen}
      onClose={onClose}
      aria-labelledby={modalHeadingId}
      aria-describedby={modalDescriptionId}
      selectorPrimaryFocus={selectorPrimaryFocus}
      preventCloseOnClickOutside={false}
      {...rest}>
      {children}
    </ComposedModal>
  );
};

export default AccessibleModal;
