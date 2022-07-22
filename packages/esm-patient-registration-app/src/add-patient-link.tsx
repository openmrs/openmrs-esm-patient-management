import React from 'react';
import UserFollow20 from '@carbon/icons-react/es/user--follow/20';
import styles from './add-patient-link.scss';
import { navigate } from '@openmrs/esm-framework';
import { HeaderGlobalAction } from 'carbon-components-react';

export default function Root() {
  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  return (
    <HeaderGlobalAction
      aria-label="Add Patient"
      aria-labelledby="Add Patient"
      name="AddPatientIcon"
      onClick={addPatient}
      className={styles.slotStyles}>
      <UserFollow20 />
    </HeaderGlobalAction>
  );
}
