import React from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import { UserFollow } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import styles from './add-patient-link.scss';
import { useTranslation } from 'react-i18next';

export default function Root() {
  const { t } = useTranslation();
  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  return (
    <HeaderGlobalAction
      aria-label={t('addPatient', 'Add Patient')}
      aria-labelledby={t('addPatient', 'Add Patient')}
      enterDelayMs={500}
      name="AddPatientIcon"
      onClick={addPatient}
      className={styles.slotStyles}>
      <UserFollow size={20} />
    </HeaderGlobalAction>
  );
}
