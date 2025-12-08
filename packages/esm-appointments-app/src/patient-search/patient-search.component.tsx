import React from 'react';
import { ExtensionSlot, launchWorkspace } from '@openmrs/esm-framework';
import styles from './patient-search.scss';

const PatientSearch: React.FC = () => {
  const launchCreateAppointmentForm = (patient) => {
    const props = {
      patientUuid: patient.uuid,
      context: 'creating',
      mutate: () => {}, // TODO get this to mutate properly
    };

    launchWorkspace('appointments-form-workspace', { ...props });
  };

  return (
    <div className="omrs-main-content">
      <span className={styles.searchBarWrapper}>
        <ExtensionSlot
          name="patient-search-bar-slot"
          state={{
            selectPatientAction: launchCreateAppointmentForm,
            buttonProps: {
              kind: 'primary',
            },
          }}
        />
      </span>
    </div>
  );
};

export default PatientSearch;
