import React, { useMemo, useState } from 'react';
import { ArrowRight, Filter } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import AppointmentsHeader from '../../../appointments-header/appointments-header.component';
import isBetween from 'dayjs/plugin/isBetween';
import { CalendarType } from '../../utils/types';
import Header from '../Header';
import Cell from '../Cell';
import styles from './Calendar.module.scss';
import { monthDays } from '../../functions/monthly';
import MonthlyCalendarView from './MonthlyCalendar';
import {
  StructuredListSkeleton,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListCell,
  StructuredListRow,
  StructuredListBody,
  Button,
  ContentSwitcher,
  Switch,
  Tab,
  TabList,
  Tabs,
  TabPanel,
  TabPanels,
} from '@carbon/react';
import DailyCalendarView from './DailyCalendar';
import WeeklyCalendarView from './WeeklyCalendar';

interface AppointmentsCalendarListViewProps {}
dayjs.extend(isBetween);
const CalendarView: React.FC<AppointmentsCalendarListViewProps> = () => {
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useState(0);
  const events = [
    {
      title: 'Dr John Doe',
      start: '2022-11-15 14:20:00',
      end: '2022-11-15 14:30:00',
    },
    {
      title: 'Dr John Doe',
      start: '2022-11-02 04:00:00',
      end: '2022-11-02 04:40:00',
    },
    {
      title: 'Missed Appointment',
      start: '2022-11-01 01:50:00',
      end: '2022-11-01 02:40:00',
    },
    {
      title: 'Walkin Appointment',
      start: '2022-11-01 03:20:00',
      end: '2022-11-01 03:40:00',
    },
    {
      title: 'Scheduled Appointment',
      start: '2022-11-01 04:00:00',
      end: '2022-11-01 04:40:00',
    },
    {
      title: 'Walkin Apppointment',
      start: '2022-10-29 06:50:00',
      end: '2022-10-29 07:40:00',
    },
  ];

  return (
    <>
      <div>
        <AppointmentsHeader title={t('clinicalAppointments', 'Clinical Appointments')} />
      </div>
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
          <Tab>{t('daily', 'Daily')}</Tab>
          <Tab>{t('weekly', 'Weekly')}</Tab>
          <Tab>{t('monthly', 'Monthly')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>{<DailyCalendarView type="daily" events={events} />}</TabPanel>
          <TabPanel style={{ padding: 0 }}>{<WeeklyCalendarView type="weekly" events={events} />}</TabPanel>
          <TabPanel style={{ padding: 0 }}>{<MonthlyCalendarView type="monthly" events={events} />}</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default CalendarView;
