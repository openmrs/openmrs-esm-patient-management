import React from 'react';
import { useTranslation } from 'react-i18next';
import { MappedAppointment } from '../types/index';
import styles from './appointment-details.scss';
import { usePatientAppointmentHistory } from '../hooks/usePatientAppointmentHistory';
import { formatDate } from '@openmrs/esm-framework';

interface AppointmentDetailsProps {
  appointment: MappedAppointment;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { appointmentsCount } = usePatientAppointmentHistory(appointment.patientUuid, new AbortController());

  return (
    <div className={styles.appointmentDetailsContainer}>
      <p className={styles.title}>{appointment.serviceType}</p>
      <p className={styles.subTitle}>{formatDate(new Date(appointment.dateTime))}</p>

      <div className={styles.patientInfoGrid}>
        <div>
          <p className={styles.gridTitle}>{t('patientDetails', 'Patient details')}</p>
          <p className={styles.label}>{appointment.name}</p>
          <p className={styles.label}>{appointment.age}</p>
          <p className={styles.label}>{appointment.gender}</p>
          <p className={styles.label}>{appointment.dob}</p>
          <p className={styles.label}>{appointment.phoneNumber}</p>
        </div>
        <div>
          <p className={styles.gridTitle}>{t('appointmentNotes', 'Appointment Notes')}</p>
          <p className={styles.label}>{appointment.comments}</p>
        </div>
        <div>
          <p className={styles.gridTitle}>{t('appointmentHistory', 'Appointment History')}</p>
          <div className={styles.historyGrid}>
            <div>
              <p className={styles.historyGridLabel}>{t('completed', 'Completed')}</p>
              <span className={styles.historyGridCount}>{appointmentsCount.completedAppointments}</span>
            </div>
            <div>
              <p className={styles.historyGridLabel}>{t('missed', 'Missed')}</p>
              <span className={styles.historyGridCountRed}>{appointmentsCount.missedAppointments}</span>
            </div>
            <div>
              <p className={styles.historyGridLabel}>{t('cancelled', 'Cancelled')}</p>
              <span className={styles.historyGridCount}>{appointmentsCount.cancelledAppointments}</span>
            </div>
            <div>
              <p className={styles.historyGridLabel}>{t('upcomming', 'Upcoming')}</p>
              <span className={styles.historyGridCount}>{appointmentsCount.upcomingAppointments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
