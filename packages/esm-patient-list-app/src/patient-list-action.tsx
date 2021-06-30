import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const handleClick = React.useCallback(() => {
    console.log('handling click');
    setModalOpen((m) => !m);
  }, []);
  const closeModal = React.useCallback(() => setModalOpen(false), []);

  return (
    <>
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t('openPatientList', 'Add To Patient List')}
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: '100vw',
          }}>
          <span className="bx--overflow-menu-options__option-content">
            {t('openPatientList', 'Add To Patient List')}
          </span>
        </button>
      </li>
      {modalOpen && (
        <Modal close={closeModal}>
          <div style={{ backgroundColor: '#f4f4f4', height: '70vh', width: '90vw' }}>hello there</div>
        </Modal>
      )}
    </>
  );
};

export default AddPastVisitOverflowMenuItem;
