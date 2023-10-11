import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@carbon/react';
import { Events } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-list-action-button.scss';

const PatientListActionButton: React.FC = () => {
  const navigateToPatientList = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/home/patient-lists' }), []);

  const { t } = useTranslation();
  const layout = useLayoutType();

  if (layout === 'tablet') {
    return (
      <Button kind="ghost" className={styles.container} role="button" tabIndex={0} onClick={navigateToPatientList}>
        <Events size={16} />
        <span>{t('patientLists', 'Patient lists')}</span>
      </Button>
    );
  }

  return (
    <IconButton
      align="left"
      className={styles.container}
      enterDelayMs={1000}
      kind="ghost"
      label={t('patientLists', 'Patient lists')}
      onClick={navigateToPatientList}>
      <Events size={20} />
    </IconButton>
  );
};

export default PatientListActionButton;
