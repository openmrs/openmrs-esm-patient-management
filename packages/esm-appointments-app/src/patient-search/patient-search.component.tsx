import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './patient-search.scss';
import { closeOverlay, launchOverlay } from '../hooks/useOverlay';
import { useTranslation } from 'react-i18next';

import AppointmentForm from '../appointment-forms/appointments-form.component';

const PatientSearch: React.FC = () => {
  const { t } = useTranslation();
  const launchCreateAppointmentForm = (patient) => {
    closeOverlay();
    launchOverlay(
      t('appointmentForm', 'Create Appointment'),
      <AppointmentForm patientUuid={patient.uuid} context="creating" />,
    );
  };

  return (
    <div className="omrs-main-content">
      <span className={styles.searchBarWrapper}>
        <ExtensionSlot
          extensionSlotName="patient-search-bar-slot"
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
