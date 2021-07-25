import React from 'react';
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

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const openModal = React.useCallback(() => {
    const dispose = showModal('add-patient-to-patient-list-modal', {
      closeModal: () => dispose(),
      patientUuid,
    });
    closeOverflowMenu();
  }, [patientUuid]);

  return (
    <>
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t('openPatientList', 'Add to list')}
          data-floating-menu-primary-focus
          onClick={openModal}
          style={{
            maxWidth: '100vw',
          }}>
          <span className="bx--overflow-menu-options__option-content">{t('openPatientList', 'Add to list')}</span>
        </button>
      </li>
    </>
  );
};

export default AddPastVisitOverflowMenuItem;
