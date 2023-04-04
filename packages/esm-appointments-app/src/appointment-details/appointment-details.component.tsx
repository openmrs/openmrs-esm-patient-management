import React from 'react';
import { useTranslation } from 'react-i18next';
import { MappedAppointment } from '../types/index';
import styles from './appointment-details.scss';
import { usePatientAppointmentHistory } from '../hooks/usePatientAppointmentHistory';
import { formatDate } from '@openmrs/esm-framework';
import { getGender } from '../helpers';

interface AppointmentDetailsProps {
  appointment: MappedAppointment;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { appointmentsCount } = usePatientAppointmentHistory(appointment.patientUuid);

  return (
    <div className={styles.appointmentDetailsContainer}>
      <p className={styles.title}>{appointment.serviceType}</p>
      <p className={styles.subTitle}>{formatDate(new Date(appointment.dateTime))}</p>

      <div className={styles.patientInfoGrid}>
        <div>
          <p className={styles.gridTitle}>{t('patientDetails', 'Patient details')}</p>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('patientName', 'Patient name')} : </p>
            <p className={styles.label}>{appointment.name}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('age', 'Age')} : </p>
            <p className={styles.label}>{appointment.age}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('gender', 'Gender')} : </p>
            <p className={styles.label}>{getGender(appointment.gender, t)}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('dob', 'Dob')} : </p>
            <p className={styles.label}>{appointment.dob}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('phoneNumber', 'Phone number')} :</p>
            <p className={styles.label}>{appointment.phoneNumber}</p>
          </div>
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
