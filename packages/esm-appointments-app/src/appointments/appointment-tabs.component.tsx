import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import ScheduledAppointments from './scheduled/scheduled-appointments.component';
import UnscheduledAppointments from './unscheduled/unscheduled-appointments.component';
import EarlyAppointments from './scheduled/early-appointments.component';
import styles from './appointment-tabs.scss';

/**
 * By default, this component shows just a table of sheduled appoingments. If the config option
 * `showUnscheduledAppointmentsTab` or `showEarlyAppointmentsTab` is enabled (or both), then it shows tabs
 * to render the respective tables.
 */
const AppointmentTabs: React.FC<{}> = () => {
  const { t } = useTranslation();
  const { showUnscheduledAppointmentsTab, showEarlyAppointmentsTab } = useConfig<ConfigObject>();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  type TabLabelAndComponent = {
    label: string;
    component: React.ReactNode;
  };

  const tabsToShow: TabLabelAndComponent[] = [
    { label: t('scheduled', 'Scheduled'), component: <ScheduledAppointments /> },
  ];

  if (showUnscheduledAppointmentsTab) {
    tabsToShow.push({ label: t('unscheduled', 'Unscheduled'), component: <UnscheduledAppointments /> });
  }

  if (showEarlyAppointmentsTab) {
    tabsToShow.push({ label: t('early', 'Early'), component: <EarlyAppointments /> });
  }

  // only show tabs if there are more than 1, otherwise just show <ScheduledAppointments />
  return (
    <div className={styles.appointmentList} data-testid="appointment-list">
      {tabsToShow.length > 1 ? (
        <div className={styles.tabs}>
          <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange}>
            <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
              {tabsToShow.map((tab) => (
                <Tab key={tab.label} className={styles.tab}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {tabsToShow.map((tab) => (
                <TabPanel key={tab.label} className={styles.tabPanel}>
                  {tab.component}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      ) : (
        <ScheduledAppointments />
      )}
    </div>
  );
};

export default AppointmentTabs;
