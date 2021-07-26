import React from 'react';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { openModal } from './AddPatientToList';

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();

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
