import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
import { useTranslation } from 'react-i18next';
import { Calendar, Hospital } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { ExtensionSlot, navigate, useConfig } from '@openmrs/esm-framework';
import styles from './metrics-header.scss';
import { spaBasePath } from '../constants';
import AppointmentForm from '../appointments/forms/create-edit-form/appointments-form.component';
import { closeOverlay, launchOverlay } from '../hooks/useOverlay';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();
  const { showCreateAppointmentButtons } = useConfig();

  const launchCreateAppointmentForm = (patientUuid) => {
    closeOverlay();
    launchOverlay(
      t('appointmentForm', 'Create Appointment'),
      <AppointmentForm patientUuid={patientUuid} context="creating" />,
    );
  };

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <div className={styles.metricsContent}>
        <Button
          kind="tertiary"
          renderIcon={Calendar}
          onClick={() => navigate({ to: `${spaBasePath}/appointments/calendar` })}>
          {t('appointmentsCalendar', 'Appointments Calendar')}
        </Button>
        {showCreateAppointmentButtons && (
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
        )}
      </div>
    </div>
  );
};

export default MetricsHeader;
