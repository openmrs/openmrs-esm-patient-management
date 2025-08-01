import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';

function closeOverflowMenu() {
  document.body.dispatchEvent(
    new MouseEvent('mousedown', {
      view: window,
      bubbles: true,
      cancelable: true,
    }),
  );
}

interface AddPastVisitOverflowMenuItemProps {
  patientUuid: string;
}

const AddPatientToPatientListMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const openModal = useCallback(() => {
    const dispose = showModal('add-patient-to-patient-list-modal', {
      closeModal: () => dispose(),
      patientUuid,
      size: 'sm',
    });
    closeOverflowMenu();
  }, [patientUuid]);

  return (
    <>
      <li className="cds--overflow-menu-options__option">
        <button
          className="cds--overflow-menu-options__btn"
          role="menuitem"
          data-floating-menu-primary-focus
          onClick={openModal}
          style={{
            maxWidth: '100vw',
          }}>
          <span className="cds--overflow-menu-options__option-content">{t('openPatientList', 'Add to list')}</span>
        </button>
      </li>
    </>
  );
};

export default AddPatientToPatientListMenuItem;
