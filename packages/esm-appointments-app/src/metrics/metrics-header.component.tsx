import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';

import { useTranslation } from 'react-i18next';
import { Calendar, Hospital } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { ExtensionSlot, navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../constants';
import { closeOverlay, launchOverlay } from '../hooks/useOverlay';
import styles from './metrics-header.scss';
import AppointmentsForm from '../form/appointments-form.component';

dayjs.extend(isToday);

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  const launchCreateAppointmentForm = (patientUuid) => {
    const props = {
      patientUuid: patientUuid,
      context: 'creating',
      closeWorkspace: closeOverlay,
      mutate: () => {}, // TODO get this to mutate properly
    };
    closeOverlay();
    launchOverlay(t('appointmentForm', 'Create Appointment'), <AppointmentsForm {...props} />);
  };

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <div className={styles.metricsContent}>
        <Button
          kind="tertiary"
          renderIcon={Calendar}
          onClick={() => navigate({ to: `${spaHomePage}/appointments/calendar` })}>
          {t('appointmentsCalendar', 'Appointments Calendar')}
        </Button>
        <ExtensionSlot
          name="patient-search-button-slot"
          state={{
            selectPatientAction: launchCreateAppointmentForm,
            buttonText: t('createNewAppointment', 'Create new appointment'),
            overlayHeader: t('createNewAppointment', 'Create new appointment'),
            buttonProps: {
              kind: 'primary',
              renderIcon: (props) => <Hospital size={32} {...props} />,
              size: 'lg',
            },
          }}
        />
      </div>
    </div>
  );
};

export default MetricsHeader;
