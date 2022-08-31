import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import styles from './missed-appointment-list.scss';
import MissedAppointments from '../appointments-tabs/missed-appointments.component';
import DefaulterAppointments from '../appointments-tabs/defaulter-appointments.component';
import LTFUAppointments from '../appointments-tabs/ltfu-appointments.component';
import PromisedAppointments from '../appointments-tabs/promised-appointments.component';

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
              <MissedAppointments status={MissedAppointmentTypes.MISSED} />
            </TabPanel>
            <TabPanel>
              <DefaulterAppointments status={MissedAppointmentTypes.DEFAULTERS} />
            </TabPanel>
            <TabPanel>{<LTFUAppointments status={MissedAppointmentTypes.LTFU} />}</TabPanel>
            <TabPanel>{<PromisedAppointments status={MissedAppointmentTypes.PROMISED} />}</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default MissedAppointmentList;
