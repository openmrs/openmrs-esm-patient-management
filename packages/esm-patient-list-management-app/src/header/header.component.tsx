import React from 'react';
import { useTranslation } from 'react-i18next';
import { Add } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { PageHeader, PageHeaderContent, PatientListsPictogram } from '@openmrs/esm-framework';
import styles from './header.scss';

interface HeaderProps {
  handleShowNewListOverlay: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleShowNewListOverlay }) => {
  const { t } = useTranslation();
  return (
    <PageHeader className={styles.header}>
      <PageHeaderContent title={t('patientLists', 'Patient lists')} illustration={<PatientListsPictogram />} />
      <Button
        className={styles.newListButton}
        data-openmrs-role="New List"
        kind="ghost"
        iconDescription="Add"
        renderIcon={(props) => <Add {...props} size={16} />}
        onClick={handleShowNewListOverlay}
        size="sm">
        {t('newList', 'New list')}
      </Button>
    </PageHeader>
  );
};

export default Header;
