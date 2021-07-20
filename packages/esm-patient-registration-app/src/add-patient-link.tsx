import React from 'react';
import Add20 from '@carbon/icons-react/es/add/20';
import styles from './add-patient-link.scss';
import { navigate } from '@openmrs/esm-framework';
import { HeaderGlobalAction } from 'carbon-components-react/es/components/UIShell';

export default function Root() {
  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  return (
    <HeaderGlobalAction
      aria-label="Add Patient"
      aria-labelledby="Add Patient"
      name="AddPatientIcon"
      onClick={addPatient}
      className={styles.slotStyles}>
      <Add20 />
    </HeaderGlobalAction>
  );
}
