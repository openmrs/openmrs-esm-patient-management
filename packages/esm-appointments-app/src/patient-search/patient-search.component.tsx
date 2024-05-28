import React from 'react';
import { ExtensionSlot, launchWorkspace } from '@openmrs/esm-framework';
import styles from './patient-search.scss';
import { useTranslation } from 'react-i18next';

const PatientSearch: React.FC = () => {
  const { t } = useTranslation();
  const launchCreateAppointmentForm = (patient) => {
    const props = {
      patientUuid: patient.uuid,
      context: 'creating',
      mutate: () => {}, // TODO get this to mutate properly
    };
    launchWorkspace('create-appointment', { ...props });
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
