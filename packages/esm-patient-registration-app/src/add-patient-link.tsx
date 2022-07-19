import React from 'react';
import { Add } from '@carbon/react/icons';
import styles from './add-patient-link.scss';
import { navigate } from '@openmrs/esm-framework';
import { HeaderGlobalAction } from '@carbon/react';

export default function Root() {
  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  return (
    <HeaderGlobalAction
      aria-label="Add Patient"
      aria-labelledby="Add Patient"
      name="AddPatientIcon"
      onClick={addPatient}
      className={styles.slotStyles}>
      <Add size={20} />
    </HeaderGlobalAction>
  );
}
