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
            <>
              <p className={styles.title}>{t('lastEncounter', 'Last encounter')}</p>
              <p className={styles.subtitle}>
                {formatDatetime(parseDate(appointment.startDateTime))} · {appointment.service.name} ·{' '}
                {appointment.location.name}{' '}
              </p>
            </>
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
            <>
              <p className={styles.title}>{t('returnDate', 'Return date')}</p>
              <p className={styles.subtitle}>
                {formatDatetime(parseDate(appointment.startDateTime))} · {appointment.service.name} ·{' '}
                {appointment.location.name}{' '}
              </p>
            </>
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
  const headerTitle = t('appointments', 'Appointments');
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const {
    // data: appointmentsData,
    isError,
    isLoading,
    isValidating,
  } = useAppointments(patientUuid, startDate, new AbortController());

  let appointmentsData = {
    pastAppointments: [
      {
        uuid: 'a4662406-2bfe-49be-8465-6dbdfe9b4d5d',
        appointmentNumber: '0000',
        patient: {
          identifier: '1003R8',
          name: 'Brian Evans',
          uuid: '8f75dbf1-833d-498a-bc99-3a24cad5cee9',
        },
        service: {
          appointmentServiceId: 1,
          name: 'HIV return visit',
          description: null,
          speciality: {},
          startTime: '',
          endTime: '',
          maxAppointmentsLimit: null,
          durationMins: null,
          location: {},
          uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
          color: '#006400',
          initialAppointmentStatus: 'Scheduled',
          creatorName: null,
        },
        serviceType: null,
        provider: null,
        location: {
          name: 'Outpatient Clinic',
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        },
        startDateTime: '2021-10-28T11:14:17.064Z',
        endDateTime: 1649935800000,
        appointmentKind: 'Scheduled',
        status: 'Scheduled',
        comments: null,
        additionalInfo: null,
        teleconsultation: null,
        providers: [],
        voided: false,
        extensions: {
          patientEmailDefined: false,
        },
        teleconsultationLink: null,
        recurring: false.valueOf,
      },
    ],
    upcomingAppointments: [
      {
        uuid: 'a4662406-2bfe-49be-8465-6dbdfe9b4d5d',
        appointmentNumber: '0000',
        patient: {
          identifier: '1003R8',
          name: 'Brian Evans',
          uuid: '8f75dbf1-833d-498a-bc99-3a24cad5cee9',
        },
        service: {
          appointmentServiceId: 1,
          name: 'Clinical observation',
          description: null,
          speciality: {},
          startTime: '',
          endTime: '',
          maxAppointmentsLimit: null,
          durationMins: null,
          location: {},
          uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
          color: '#006400',
          initialAppointmentStatus: 'Scheduled',
          creatorName: null,
        },
        serviceType: null,
        provider: null,
        location: {
          name: 'Outpatient Clinic',
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        },
        startDateTime: 1649934000000,
        endDateTime: 1649935800000,
        appointmentKind: 'Scheduled',
        status: 'Scheduled',
        comments: null,
        additionalInfo: null,
        teleconsultation: null,
        providers: [],
        voided: false,
        extensions: {
          patientEmailDefined: false,
        },
        teleconsultationLink: null,
        recurring: false.valueOf,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <InlineLoading description={t('loading', 'Loading...')} />
      </div>
    );
  }
  if (Object.keys(appointmentsData)?.length >= 1) {
    return (
      <>
        <PastAppointmentDetails pastAppointments={appointmentsData.pastAppointments} />
        <UpcomingAppointmentDetails upcomingAppointments={appointmentsData.upcomingAppointments} />
      </>
    );
  }
};

export default AppointmentDetails;
