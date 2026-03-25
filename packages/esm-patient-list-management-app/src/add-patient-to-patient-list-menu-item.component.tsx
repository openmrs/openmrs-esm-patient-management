import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import styles from './add-patient-to-patient-list-menu-item.scss';

interface AddPastVisitOverflowMenuItemProps {
  patientUuid: string;
  closeMenu?: () => void;
}

const AddPatientToPatientListMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = ({ patientUuid, closeMenu }) => {
  const { t } = useTranslation();

  const openModal = useCallback(() => {
    const dispose = showModal('add-patient-to-patient-list-modal', {
      closeModal: () => dispose(),
      patientUuid,
      size: 'sm',
    });
    closeMenu?.();
  }, [patientUuid, closeMenu]);

  return (
    <OverflowMenuItem
      className={styles.menuitem}
      closeMenu={closeMenu}
      itemText={t('openPatientList', 'Add to list')}
      onClick={openModal}
    />
  );
};

export default AddPatientToPatientListMenuItem;
