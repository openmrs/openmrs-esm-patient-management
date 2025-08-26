import React from 'react';
import { useTranslation } from 'react-i18next';
import { Add } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { PageHeader, PageHeaderContent, PatientListsPictogram, launchWorkspace } from '@openmrs/esm-framework';
import styles from './header.scss';

interface HeaderProps {
  onCreateSuccess?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateSuccess }) => {
  const { t } = useTranslation();
  const openCreateListWorkspace = () =>
    launchWorkspace('patient-list-form-workspace', {
      workspaceTitle: t('newPatientListHeader', 'New patient list'),
      onSuccess: onCreateSuccess,
    });

  return (
    <PageHeader className={styles.header}>
      <PageHeaderContent title={t('patientLists', 'Patient lists')} illustration={<PatientListsPictogram />} />
      <Button
        className={styles.newListButton}
        data-openmrs-role="New List"
        kind="ghost"
        iconDescription={t('add', 'Add')}
        renderIcon={(props) => <Add {...props} size={16} />}
        onClick={openCreateListWorkspace}
        size="sm">
        {t('newList', 'New list')}
      </Button>
    </PageHeader>
  );
};

export default Header;
