import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ListBulleted } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-list-action-button.scss';

const PatientListActionButton: React.FC = () => {
  const navigateToPatientList = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-list' }), []);

  const { t } = useTranslation();
  const layout = useLayoutType();

  if (layout === 'tablet') {
    return (
      <Button kind="ghost" className={styles.container} role="button" tabIndex={0} onClick={navigateToPatientList}>
        <ListBulleted size={20} />
        <span>{t('patientList', 'Patient list')}</span>
      </Button>
    );
  }
  return (
    <Button
      className={styles.container}
      onClick={navigateToPatientList}
      kind="ghost"
      renderIcon={(props) => <ListBulleted {...props} />}
      hasIconOnly
      iconDescription={t('patientList', 'Patient list')}
      tooltipAlignment="start"
      tooltipPosition="left"
    />
  );
};

export default PatientListActionButton;
