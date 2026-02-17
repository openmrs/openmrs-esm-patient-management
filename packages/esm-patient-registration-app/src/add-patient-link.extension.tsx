import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderGlobalAction } from '@carbon/react';
import { UserFollow } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import styles from './add-patient-link.scss';

export default function Root() {
  const { t } = useTranslation();
  const addPatient = useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  return (
    <HeaderGlobalAction
      aria-label={t('addPatient', 'Add patient')}
      aria-labelledby={t('addPatient', 'Add patient')}
      // @ts-expect-error - `name` is not a valid prop for the HeaderGlobalAction component, but we need it for the user onboarding app
      name="AddPatientIcon"
      onClick={addPatient}
      className={styles.slotStyles}>
      <UserFollow size={20} />
    </HeaderGlobalAction>
  );
}
