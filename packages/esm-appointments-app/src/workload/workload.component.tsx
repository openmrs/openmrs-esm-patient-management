import React, { useState } from 'react';
import { Tabs, Tab, TabPanel, TabPanels, TabList } from '@carbon/react';
import WorkloadCard from './workload-card.component';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useCalendarDistribution, useMonthlyCalendarDistribution } from './workload.resource';
import styles from './workload.scss';
import { useAppointmentService } from '../form/appointments-form.resource';
import MonthlyCalendarView from './monthly-view-workload/monthly-view.component';

interface WorkloadProps {
  selectedService: string;
  appointmentDate: Date;
  onWorkloadDateChange: (pickedDate: Date) => void;
}

const Workload: React.FC<WorkloadProps> = ({ selectedService, appointmentDate, onWorkloadDateChange }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: services } = useAppointmentService();
  const serviceUuid = services?.find((service) => service.name === selectedService)?.uuid;
  const calendarWorkload = useCalendarDistribution(serviceUuid, selectedTab === 0 ? 'week' : 'month', appointmentDate);
  const monthlyCalendarWorkload = useMonthlyCalendarDistribution(
    serviceUuid,
    selectedTab === 0 ? 'week' : 'month',
    appointmentDate,
  );
  const handleDateClick = (pickedDate: Date) => {
    onWorkloadDateChange(pickedDate);
  };

  return (
    <div className={styles.workLoadContainer}>
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }}>
          <Tab>{t('weekly', 'Weekly')}</Tab>
          <Tab>{t('monthly', 'Monthly')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>
            <div className={styles.workLoadCard}>
              {calendarWorkload?.map(({ date, count }, index) => {
                return (
                  <WorkloadCard
                    key={`${date}-${index}`}
                    day={dayjs(date).format('ddd')}
                    date={dayjs(date).format('DD/MM')}
                    count={count}
                    isActive={dayjs(date).format('DD-MM-YYYY') === dayjs(appointmentDate).format('DD-MM-YYYY')}
                  />
                );
              })}
            </div>
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>
            <div>
              <div>
                <MonthlyCalendarView
                  calendarWorkload={monthlyCalendarWorkload}
                  dateToDisplay={appointmentDate.toISOString()}
                  onDateClick={handleDateClick}
                />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default Workload;
