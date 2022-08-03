import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { InlineLoading } from 'carbon-components-react';
import { useAppointments } from './appointments.resource';
import styles from './appointment-details.component.scss';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';

interface AppointmentDetailsProps {
  patientUuid: string;
}

interface PastAppointmentDetailsProps {
  pastAppointments: Array<any>;
}

interface UpcomingAppointmentDetailsProps {
  upcomingAppointments: Array<any>;
}

const PastAppointmentDetails: React.FC<PastAppointmentDetailsProps> = ({ pastAppointments }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.widgetCard}>
      {pastAppointments.length >= 1 ? (
        pastAppointments.map((appointment, index) => {
          return (
            <React.Fragment key={`past-appointment-${index}`}>
              <p className={styles.title}>{t('lastEncounter', 'Last encounter')}</p>
              <p className={styles.subtitle}>
                {formatDatetime(parseDate(appointment.startDateTime))} · {appointment.service.name} ·{' '}
                {appointment.location.name}{' '}
              </p>
            </React.Fragment>
          );
        })
      ) : (
        <p className={styles.content}>
          {t('noLastEncounter', 'There is no last encounter to display for this patient')}
        </p>
      )}
    </div>
  );
};

const UpcomingAppointmentDetails: React.FC<UpcomingAppointmentDetailsProps> = ({ upcomingAppointments }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.widgetCard}>
      {upcomingAppointments.length >= 1 ? (
        upcomingAppointments.map((appointment, index) => {
          return (
            <React.Fragment key={`upcoming-appointment-${index}`}>
              <p className={styles.title}>{t('returnDate', 'Return date')}</p>
              <p className={styles.subtitle}>
                {formatDatetime(parseDate(appointment.startDateTime))} · {appointment.service.name} ·{' '}
                {appointment.location.name}{' '}
              </p>
            </React.Fragment>
          );
        })
      ) : (
        <p className={styles.content}>{t('noReturnDate', 'There is no return date to display for this patient')}</p>
      )}
    </div>
  );
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const { data, isError, isLoading, isValidating } = useAppointments(patientUuid, startDate, new AbortController());

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <InlineLoading description={t('loading', 'Loading...')} role="progressbar" />
      </div>
    );
  }
  if (Object.keys(data)?.length >= 1) {
    return (
      <>
        <PastAppointmentDetails pastAppointments={data.pastAppointments} />
        <UpcomingAppointmentDetails upcomingAppointments={data.upcomingAppointments} />
      </>
    );
  }
};

export default AppointmentDetails;
