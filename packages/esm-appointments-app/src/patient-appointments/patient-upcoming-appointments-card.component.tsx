import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  InlineLoading,
  InlineNotification,
  RadioButton,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { ErrorCard, formatDate, parseDate, showSnackbar, type Visit } from '@openmrs/esm-framework';
import { changeAppointmentStatus, usePatientAppointments } from './patient-appointments.resource';
import { type Appointment } from '../types';
import { useMutateAppointments } from '../form/appointments-form.resource';
import styles from './patient-upcoming-appointments-card.scss';

interface VisitFormCallbacks {
  onVisitCreatedOrUpdated: (visit: Visit) => Promise<any>;
}

// See VisitFormExtensionState in esm-patient-chart-app
export interface PatientUpcomingAppointmentsProps {
  setVisitFormCallbacks(callbacks: VisitFormCallbacks);
  visitFormOpenedFrom: string;
  patientChartConfig?: {
    showUpcomingAppointments: boolean;
  };
  patientUuid: string;
}

/**
 * This is an extension that gets slotted into the patient chart start visit form when
 * the appropriate config values are enabled.
 * @param param0
 * @returns
 */
const PatientUpcomingAppointmentsCard: React.FC<PatientUpcomingAppointmentsProps> = ({
  patientUuid,
  setVisitFormCallbacks,
  patientChartConfig,
}) => {
  const { t } = useTranslation();
  const startDate = useMemo(() => dayjs().subtract(6, 'month').toISOString(), []);
  const headerTitle = t('upcomingAppointments', 'Upcoming appointments');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment>(null);
  const { mutateAppointments } = useMutateAppointments();
  const memoMutateAppointments = useMemo(() => mutateAppointments, [mutateAppointments]);

  const ac = useMemo<AbortController>(() => new AbortController(), []);
  useEffect(() => () => ac.abort(), [ac]);
  const { data: appointmentsData, error, isLoading } = usePatientAppointments(patientUuid, startDate, ac);

  const onVisitCreatedOrUpdated = useMemo(
    () => ({
      onVisitCreatedOrUpdated: () => {
        if (selectedAppointment) {
          return changeAppointmentStatus('CheckedIn', selectedAppointment.uuid)
            .then(() => {
              memoMutateAppointments();
              showSnackbar({
                isLowContrast: true,
                kind: 'success',
                subtitle: t('appointmentMarkedChecked', 'Appointment marked as Checked In'),
                title: t('appointmentCheckedIn', 'Appointment Checked In'),
              });
            })
            .catch((error) => {
              showSnackbar({
                title: t('updateError', 'Error updating upcoming appointment'),
                kind: 'error',
                isLowContrast: false,
                subtitle: error?.message,
              });
            });
        } else {
          return Promise.resolve();
        }
      },
    }),
    [selectedAppointment, memoMutateAppointments, t],
  );

  useEffect(() => {
    setVisitFormCallbacks(onVisitCreatedOrUpdated);
  }, [onVisitCreatedOrUpdated, setVisitFormCallbacks]);

  const todaysAppointments = appointmentsData?.todaysAppointments?.length ? appointmentsData?.todaysAppointments : [];
  const futureAppointments = appointmentsData?.upcomingAppointments?.length
    ? appointmentsData?.upcomingAppointments
    : [];

  const appointments = todaysAppointments
    .concat(futureAppointments)
    .filter((appointment) => appointment.status !== 'CheckedIn');

  const handleRadioChange = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  if (!patientChartConfig.showUpcomingAppointments) {
    return null;
  }

  if (error) {
    return <ErrorCard headerTitle={headerTitle} error={error} />;
  }

  if (isLoading) {
    return (
      <span>
        <InlineLoading />
      </span>
    );
  }

  if (appointments.length) {
    return (
      <div>
        <div>
          <p className={styles.sectionTitle}>{headerTitle}</p>
          <span className={styles.headerLabel}>{t('appointmentToFulfill', 'Select appointment to fulfill')}</span>
        </div>
        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('date', 'Date')}</StructuredListCell>
              <StructuredListCell head>{t('appointmentType', 'Appointment type')}</StructuredListCell>
              <StructuredListCell head>{t('action', 'Action')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {appointments.map((appointment, index) => (
              <StructuredListRow key={index} className={styles.structuredList}>
                <StructuredListCell>
                  {formatDate(parseDate(appointment.startDateTime), { mode: 'wide' })}
                </StructuredListCell>
                <StructuredListCell>{appointment.service ? appointment.service.name : '——'}</StructuredListCell>
                <StructuredListCell>
                  <RadioButton
                    className={styles.radioButton}
                    hideLabel
                    labelText={appointment.service?.name || t('appointment', 'Appointment')}
                    id={`radio-${index}`}
                    name="appointmentRadio"
                    value={appointment.uuid}
                    checked={selectedAppointment === appointment}
                    onChange={() => handleRadioChange(appointment)}
                  />
                </StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    );
  }

  return (
    <InlineNotification
      className={styles.inlineNotification}
      kind="info"
      lowContrast
      subtitle={t('noUpcomingAppointments', 'No upcoming appointments found')}
      title={t('upcomingAppointments', 'Upcoming appointments')}
    />
  );
};

export default PatientUpcomingAppointmentsCard;
