import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './appointment-details.scss';
import { Row, Grid, Column, Tag } from 'carbon-components-react';
import { MappedAppointment } from '../types/index';

export default function AppointmentDetails({ appointment }: { appointment: MappedAppointment }) {
  const { t } = useTranslation();

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
                <p className={styles.appointmentHistoryLabel}>50</p>
                <span>{t('cancelled', 'Cancelled')}</span>
                <p className={styles.appointmentHistoryLabel}>10</p>
              </Column>
              <Column>
                <span>{t('missed', 'Missed')}</span>
                <p className={styles.appointmentHistoryMissedLabel}>20</p>
                <span>{t('upcoming', 'Upcoming')}</span>
                <p className={styles.appointmentHistoryLabel}>6</p>
              </Column>
            </Row>
          </Column>
        </Row>
      </Grid>
    </div>
  );
}
