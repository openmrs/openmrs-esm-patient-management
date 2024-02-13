import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './patient-search.scss';
import { closeOverlay, launchOverlay } from '../hooks/useOverlay';
import { useTranslation } from 'react-i18next';
import AppointmentsForm from '../form/appointments-form.component';

const PatientSearch: React.FC = () => {
  const { t } = useTranslation();
  const launchCreateAppointmentForm = (patient) => {
    const props = {
      patientUuid: patient.uuid,
      context: 'creating',
      closeWorkspace: closeOverlay,
      mutate: () => {}, // TODO get this to mutate properly
    };

    closeOverlay();
    launchOverlay(t('appointmentForm', 'Create Appointment'), <AppointmentsForm {...props} />);
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
