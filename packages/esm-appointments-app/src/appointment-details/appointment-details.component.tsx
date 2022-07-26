import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './appointment-details.scss';
import { Row, Grid, Column } from 'carbon-components-react';
import { MappedAppointment } from '../types/index';

export default function AppointmentDetails({ appointment }: { appointment: MappedAppointment }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Grid>
        <p className={styles.heading}>{appointment.visitType}</p>
        <p className={styles.subHeading}>{appointment.dateTime.content.props.children}</p>
        <Row>
          <Column>
            <p className={styles.heading}>{t('patientDetails', 'Patient Details')}</p>
            <span className={styles.label}>{appointment.name.content.props.children}</span> <br></br>
            <span className={styles.label}>{appointment.age}</span> <br></br>
            <span className={styles.label}>{appointment.gender}</span> <br></br>
            <span className={styles.label}>{appointment.dob}</span> <br></br>
            <span className={styles.label}>{appointment.phoneNumber}</span> <br></br>
          </Column>
          <Column>
            <p className={styles.heading}>{t('appointmentNotes', 'Appointment Notes')}</p>
            <span>{appointment.comments}</span>
          </Column>
          <Column>
            <span className={styles.heading}>{t('appointmentHistory', 'Appointment History')}</span>
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
