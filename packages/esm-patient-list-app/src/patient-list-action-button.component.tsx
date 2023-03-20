import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Events } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-list-action-button.scss';

const PatientListActionButton: React.FC = () => {
  const navigateToPatientList = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-list' }), []);

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
    <Button
      className={styles.container}
      onClick={navigateToPatientList}
      kind="ghost"
      renderIcon={(props) => <Events size={20} {...props} />}
      hasIconOnly
      iconDescription={t('patientLists', 'Patient lists')}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      size="sm"
    />
  );
};

export default PatientListActionButton;
