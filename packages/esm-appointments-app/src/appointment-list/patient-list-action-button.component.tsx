import React from 'react';
import ListBulleted20 from '@carbon/icons-react/es/list--bulleted/20';
import styles from './patient-list-action-button.scss';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { Button } from 'carbon-components-react';

const PatientListActionButton: React.FC = () => {
  const navigateToPatientList = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-list' }), []);

  const { t } = useTranslation();
  const layout = useLayoutType();

  if (layout === 'tablet') {
    return (
      <Button kind="ghost" className={styles.container} role="button" tabIndex={0} onClick={navigateToPatientList}>
        <ListBulleted20 />
        <span>{t('patientList', 'Patient list')}</span>
      </Button>
    );
  }
  return (
    <Button
      className={styles.container}
      onClick={navigateToPatientList}
      kind="ghost"
      renderIcon={ListBulleted20}
      hasIconOnly
      iconDescription={t('patientList', 'Patient list')}
      tooltipAlignment="start"
      tooltipPosition="left"
    />
  );
};

export default PatientListActionButton;
