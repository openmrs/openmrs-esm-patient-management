import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { formatDatetime, parseDate, Visit } from '@openmrs/esm-framework';
import { useAppointments } from './appointments.resource';
import styles from './appointment-details.scss';
import { usePastVisits } from '../past-visit/past-visit.resource';
import { Appointment } from '../types';

interface AppointmentDetailsProps {
  patientUuid: string;
}

interface PastAppointmentDetailsProps {
  pastVisit: Visit;
  isLoading: boolean;
}

interface UpcomingAppointmentDetailsProps {
  upcomingAppointment: Appointment;
  isLoading: boolean;
}

const PastAppointmentDetails: React.FC<PastAppointmentDetailsProps> = ({ pastVisit, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <InlineLoading description={t('loading', 'Loading...')} role="progressbar" />
      </div>
    );
  }

  if (pastVisit) {
    return (
      <div className={styles.widgetCard}>
        <React.Fragment>
          <p className={styles.title}>{t('lastEncounter', 'Last encounter')}</p>
          <p className={styles.subtitle}>
            {formatDatetime(parseDate(pastVisit?.startDatetime))} ·{' '}
            {pastVisit?.visitType ? pastVisit?.visitType?.display : '--'} ·{' '}
            {pastVisit?.location ? pastVisit.location?.display : '--'}
          </p>
        </React.Fragment>
      </div>
    );
  }
  return (
    <p className={styles.content}>{t('noLastEncounter', 'There is no last encounter to display for this patient')}</p>
  );
};

const UpcomingAppointmentDetails: React.FC<UpcomingAppointmentDetailsProps> = ({ upcomingAppointment, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <InlineLoading description={t('loading', 'Loading...')} role="progressbar" />
      </div>
    );
  }

  if (upcomingAppointment) {
    return (
      <div className={styles.widgetCard}>
        <React.Fragment>
          <p className={styles.title}>{t('returnDate', 'Return date')}</p>
          <p className={styles.subtitle}>
            {formatDatetime(parseDate(upcomingAppointment?.startDateTime))} ·{' '}
            {upcomingAppointment?.service ? upcomingAppointment?.service?.name : '--'} ·{' '}
            {upcomingAppointment?.location ? upcomingAppointment?.location?.name : '--'}{' '}
          </p>
        </React.Fragment>
      </div>
    );
  }

  return <p className={styles.content}>{t('noReturnDate', 'There is no return date to display for this patient')}</p>;
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const { upcomingAppointment, isLoading } = useAppointments(patientUuid, startDate, new AbortController());
  const { visits, isLoading: loading } = usePastVisits(patientUuid);

  return (
    <>
      <PastAppointmentDetails pastVisit={visits} isLoading={loading} />
      <UpcomingAppointmentDetails upcomingAppointment={upcomingAppointment} isLoading={isLoading} />
    </>
  );
};

export default AppointmentDetails;
