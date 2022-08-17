import React from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Grid, Column, Tag } from '@carbon/react';
import { MappedAppointment } from '../types/index';
import styles from './appointment-details.scss';
import { usePatientAppointmentHistory } from '../hooks/usePatientAppointmentHistory';

export default function AppointmentDetails({ appointment }: { appointment: MappedAppointment }) {
  const { t } = useTranslation();
  const { appointmentsCount } = usePatientAppointmentHistory(appointment.patientUuid, new AbortController());

  return (
    <div className={styles.container}>
      <Grid>
        <p className={styles.heading}>{appointment.serviceType}</p>
        <p className={styles.subHeading}>{appointment.dateTime}</p>
        <Tag type="red" size="sm" className={styles.tag}>
          {t('missedAppointment', 'Missed appointment')}
        </Tag>
        <Row>
          <Column>
            <h4 className={styles.heading}>{t('patientDetails', 'Patient Details')}</h4>
            <p className={styles.label}>{appointment.name}</p>
            <p className={styles.label}>{appointment.age}</p>
            <p className={styles.label}>{appointment.gender}</p>
            <p className={styles.label}>{appointment.dob}</p>
            <p className={styles.label}>{appointment.phoneNumber}</p>
          </Column>
          <Column>
            <h4 className={styles.heading}>{t('appointmentNotes', 'Appointment Notes')}</h4>
            <span>{appointment.comments}</span>
          </Column>
          <Column>
            <h4 className={styles.heading}>{t('appointmentHistory', 'Appointment History')}</h4>
            <Row>
              <Column>
                <span>{t('completed', 'Completed')}</span>
                <p className={styles.appointmentHistoryLabel}> {appointmentsCount.completededAppointments}</p>
                <span>{t('cancelled', 'Cancelled')}</span>
                <p className={styles.appointmentHistoryLabel}> {appointmentsCount.cancelledAppointments} </p>
              </Column>
              <Column>
                <span>{t('missed', 'Missed')}</span>
                <p className={styles.appointmentHistoryMissedLabel}> {appointmentsCount.missedAppointments}</p>
                <span>{t('upcoming', 'Upcoming')}</span>
                <p className={styles.appointmentHistoryLabel}> {appointmentsCount.upcomingAppointments}</p>
              </Column>
            </Row>
          </Column>
        </Row>
      </Grid>
    </div>
  );
}
