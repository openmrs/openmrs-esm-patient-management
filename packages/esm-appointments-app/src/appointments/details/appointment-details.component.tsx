import React, { useEffect, useState } from 'react';
import styles from './appointment-details.scss';
import { usePatientAppointmentHistory } from '../../hooks/usePatientAppointmentHistory';
import { usePatientDetails } from '../../hooks/usePatientDetails';
import { formatDate } from '@openmrs/esm-framework';
import { getGender } from '../../helpers';
import { type Appointment } from '../../types';
import { useTranslation } from 'react-i18next';

interface AppointmentDetailsProps {
  appointment: Appointment;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const [isEnabledQuery, setIsEnabledQuery] = useState(false);
  const { appointmentsCount, isLoading } = usePatientAppointmentHistory(appointment.patient.uuid);
  const { patientDetails } = usePatientDetails(appointment.patient.uuid, isEnabledQuery);

  useEffect(() => {
    if (!isLoading) {
      setIsEnabledQuery(true);
    }
  }, [appointmentsCount, isLoading]);
  return (
    <div className={styles.appointmentDetailsContainer}>
      <p className={styles.title}>{appointment.service.name}</p>
      <p className={styles.subTitle}>{formatDate(new Date(appointment.startDateTime))}</p>

      <div className={styles.patientInfoGrid}>
        <div>
          <p className={styles.gridTitle}>{t('patientDetails', 'Patient details')}</p>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('patientName', 'Patient name')} : </p>
            <p className={styles.label}>{appointment.patient.name}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('age', 'Age')} : </p>
            <p className={styles.label}>{appointment.patient.age}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('gender', 'Gender')} : </p>
            <p className={styles.label}>{getGender(appointment.patient.gender, t)}</p>
          </div>
          <div className={styles.labelContainer}>
            <p className={styles.labelBold}>{t('dateOfBirth', 'Date of birth')} : </p>
            <p className={styles.label}>
              {patientDetails && patientDetails?.dateOfBirth
                ? formatDate(new Date(patientDetails && patientDetails?.dateOfBirth ? patientDetails?.dateOfBirth : ''))
                : ''}
            </p>
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
              <p className={styles.historyGridLabel}>{t('upcoming', 'Upcoming')}</p>
              <span className={styles.historyGridCount}>{appointmentsCount.upcomingAppointments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
