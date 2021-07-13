import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import AddPatientToList from './AddPatientToList';

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const handleClick = React.useCallback(() => {
    setModalOpen((m) => !m);
  }, []);
  const closeModal = React.useCallback(() => setModalOpen(false), []);

  return (
    <>
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t('openPatientList', 'Add to list')}
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: '100vw',
          }}>
          <span className="bx--overflow-menu-options__option-content">{t('openPatientList', 'Add to list')}</span>
        </button>
      </li>
      {modalOpen && (
        <Modal close={closeModal}>
          <AddPatientToList close={closeModal} patientUuid="" />
        </Modal>
      )}
    </>
  );
};

export default AddPastVisitOverflowMenuItem;
