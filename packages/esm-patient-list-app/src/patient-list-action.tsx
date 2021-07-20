import React from 'react';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();
  const openModal = React.useCallback(() => {
    showModal('add-patient-to-patient-list-modal', { patientUuid: '' });
  }, []);

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
