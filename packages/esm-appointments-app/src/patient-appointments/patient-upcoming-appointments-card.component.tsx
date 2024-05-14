import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Checkbox,
  InlineLoading,
  InlineNotification,
  StructuredListHead,
  StructuredListCell,
  StructuredListRow,
  StructuredListBody,
  StructuredListWrapper,
} from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { usePatientAppointments } from './patient-appointments.resource';
import { ErrorState } from '@openmrs/esm-patient-common-lib';

import styles from './patient-upcoming-appointments-card.scss';
import dayjs from 'dayjs';
interface PatientUpcomingAppointmentsProps {
  patientUuid: string;
  setUpcomingAppointment: (value: any) => void;
}

const PatientUpcomingAppointmentsCard: React.FC<PatientUpcomingAppointmentsProps> = ({
  patientUuid,
  setUpcomingAppointment,
}) => {
  const { t } = useTranslation();
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const headerTitle = t('upcomingAppointments', 'Upcoming appointments');

  const ac = useMemo<AbortController>(() => new AbortController(), []);
  useEffect(() => () => ac.abort(), [ac]);
  const { data: appointmentsData, isError, isLoading } = usePatientAppointments(patientUuid, startDate, ac);

  const todaysAppointments = appointmentsData?.todaysAppointments?.length ? appointmentsData?.todaysAppointments : [];
  const futureAppointments = appointmentsData?.upcomingAppointments?.length
    ? appointmentsData?.upcomingAppointments
    : [];

  // Filter out checked in appointments
  const appointments = todaysAppointments
    .concat(futureAppointments)
    .filter((appointment) => appointment.status !== 'CheckedIn');

  const defaultAppointment = ((appointments) => {
    // if there's only one appointment today, select it by default, otherwise no default
    const appts = appointments?.filter((appointment) =>
      dayjs(new Date(appointment.startDateTime).toISOString()).isToday(),
    );
    if (appts?.length === 1) {
      return appts[0];
    }
  })(appointments);

  if (defaultAppointment) {
    setUpcomingAppointment(defaultAppointment);
  }

  if (isError) {
    return <ErrorState headerTitle={headerTitle} error={isError} />;
  }
  if (isLoading) {
    <span>
      <InlineLoading />
    </span>;
  }

  if (appointments?.length) {
    const structuredListBodyRowGenerator = () => {
      return appointments.map((appointment, i) => (
        <StructuredListRow label key={`row-${i}`} className={styles.structuredList}>
          <StructuredListCell>{formatDate(parseDate(appointment.startDateTime), { mode: 'wide' })}</StructuredListCell>
          <StructuredListCell>{appointment.service ? appointment.service.name : '——'}</StructuredListCell>
          <StructuredListCell>
            <Checkbox
              className={styles.checkbox}
              key={i}
              labelText=""
              defaultChecked={appointment.uuid === defaultAppointment?.uuid}
              id={appointment.uuid}
              onChange={(e) => (e.target.checked ? setUpcomingAppointment(appointment) : '')}
            />
          </StructuredListCell>
        </StructuredListRow>
      ));
    };

    return (
      <div>
        <div>
          <p className={styles.sectionTitle}>{headerTitle}</p>
          <span className={styles.headerLabel}>
            {t('appointmentToFulfill', 'Select appointment(s) to fulfill')}
          </span>{' '}
        </div>

        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('date', 'Date')}</StructuredListCell>
              <StructuredListCell head>{t('appointmentType', 'Appointment type')}</StructuredListCell>
              <StructuredListCell head>{t('action', 'Action')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>{structuredListBodyRowGenerator()}</StructuredListBody>
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
