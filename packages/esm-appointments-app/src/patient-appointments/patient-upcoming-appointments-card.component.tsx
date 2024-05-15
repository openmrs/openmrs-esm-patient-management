import React, { useEffect, useMemo, useState } from 'react';
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
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { usePatientAppointments } from './patient-appointments.resource';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import styles from './patient-upcoming-appointments-card.scss';
import dayjs from 'dayjs';
import { type Appointment } from '../types';

interface PatientUpcomingAppointmentsProps {
  patientUuid: string;
  setUpcomingAppointment: (value: Appointment) => void;
}

const PatientUpcomingAppointmentsCard: React.FC<PatientUpcomingAppointmentsProps> = ({
  patientUuid,
  setUpcomingAppointment,
}) => {
  const { t } = useTranslation();
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const headerTitle = t('upcomingAppointments', 'Upcoming appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const ac = useMemo<AbortController>(() => new AbortController(), []);
  useEffect(() => () => ac.abort(), [ac]);
  const { data: appointmentsData, isError, isLoading } = usePatientAppointments(patientUuid, startDate, ac);

  const todaysAppointments = appointmentsData?.todaysAppointments?.length ? appointmentsData?.todaysAppointments : [];
  const futureAppointments = appointmentsData?.upcomingAppointments?.length
    ? appointmentsData?.upcomingAppointments
    : [];

  const appointments = todaysAppointments
    .concat(futureAppointments)
    .filter((appointment) => appointment.status !== 'CheckedIn');

  useEffect(() => {
    if (appointments.length === 1) {
      setSelectedAppointment(appointments[0]);
      setUpcomingAppointment(appointments[0]);
    }
  }, [appointments]);

  const handleRadioChange = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setUpcomingAppointment(appointment);
  };

  if (isError) {
    return <ErrorState headerTitle={headerTitle} error={isError} />;
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
          <span className={styles.headerLabel}>{t('appointmentToFulfill', 'Select appointment(s) to fulfill')}</span>
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
                    labelText=""
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
      kind={'info'}
      lowContrast
      className={styles.inlineNotification}
      title={t('upcomingAppointments', 'Upcoming appointments')}
      subtitle={t('noUpcomingAppointments', 'No upcoming appointments found')}
    />
  );
};

export default PatientUpcomingAppointmentsCard;
