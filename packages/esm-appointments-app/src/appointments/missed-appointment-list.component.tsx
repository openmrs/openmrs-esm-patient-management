import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import styles from './missed-appointment-list.scss';
import MissedAppointmentsList from '../appointments-tabs/missed-appointments.component';

enum MissedAppointmentTypes {
  MISSED = 'Scheduled',
  DEFAULTERS = 'Defaulters',
  LTFU = 'Ltfu',
  PROMISED = 'Promised',
}

const MissedAppointmentList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.appointmentList}>
      <h3 className={styles.heading}>{t('missedAppointmentsList', 'Missed Appointments List')}</h3>

      <div className={styles.wrapper}>
        <Tabs className={styles.tabs}>
          <TabList aria-label="Appointment tabs" contained>
            <Tab>{t('missed', 'Missed')}</Tab>
            <Tab>{t('defaulters', 'Defaulters')}</Tab>
            <Tab>{t('lostToFollowUp', 'Lost To Follow Up')}</Tab>
            <Tab>{t('promisedPatients', 'Promised Patients')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <MissedAppointmentsList
                status={MissedAppointmentTypes.MISSED}
                title={t('missedAppointmentsList', 'Missed Appointments List')}
              />
            </TabPanel>
            <TabPanel>
              <MissedAppointmentsList
                status={MissedAppointmentTypes.DEFAULTERS}
                title={t('defaulters', 'Defaulters')}
              />
            </TabPanel>
            <TabPanel>
              {
                <MissedAppointmentsList
                  status={MissedAppointmentTypes.LTFU}
                  title={t('lostToFollowupAppointments', 'Lost To Followup Appointments')}
                />
              }
            </TabPanel>
            <TabPanel>
              {
                <MissedAppointmentsList
                  status={MissedAppointmentTypes.PROMISED}
                  title={t('promisedPateints', 'Promised Pateints')}
                />
              }
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default MissedAppointmentList;
