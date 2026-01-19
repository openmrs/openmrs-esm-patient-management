import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate } from '@openmrs/esm-framework';

interface EditPatientDetailsButtonProps {
  onTransition?: () => void;
  patientUuid: string;
}

const EditPatientDetailsButton: React.FC<EditPatientDetailsButtonProps> = ({ patientUuid, onTransition }) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/edit` });
    onTransition?.();
  }, [onTransition, patientUuid]);

  return (
    <li className="cds--overflow-menu-options__option">
      <button
        className="cds--overflow-menu-options__btn"
        role="menuitem"
        data-floating-menu-primary-focus
        onClick={handleClick}>
        <span className="cds--overflow-menu-options__option-content">
          {t('editPatientDetails', 'Edit patient details')}
        </span>
      </button>
    </li>
  );
};

export default EditPatientDetailsButton;
