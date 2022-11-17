import React, { useMemo, useState } from 'react';
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
  Select,
  SelectItem,
} from '@carbon/react';
import { ArrowRight, Filter } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './appointments-calendar-list-view.scss';
import AppointmentsHeader from '../../../appointments-header/appointments-header.component';
import DailyCalendarView from './DailyCalendar';
import WeeklyCalendarView from './WeeklyCalendar';
import MonthlyCalendarView from './MonthlyCalendar';
import { useAllAppointments } from '../Resource/allAppointments.resource';
import dayjs, { Dayjs } from 'dayjs';
import { MappedAppointment } from '../../../types';
import { useServices } from '../../../appointments-tabs/appointments-table.resource';
import isEmpty from 'lodash-es/isEmpty';

interface AppointmentsCalendarListViewProps {
  appointment?: MappedAppointment;
  patientUuid?: string;
  context?: string;
  dateTime?: Dayjs;
}

const CalendarView: React.FC<AppointmentsCalendarListViewProps> = ({ appointment, patientUuid, dateTime }) => {
  const { t } = useTranslation();
  const initialState = {
    patientUuid,
    dateTime: undefined,
    location: '',
    serviceUuid: '',
    comments: '',
    appointmentKind: '',
    status: '',
    id: undefined,
    gender: '',
    serviceType: '',
    provider: '',
    appointmentNumber: undefined,
  };

  const { services } = useServices();
  const [selectedTab, setSelectedTab] = useState(2);
  const appointmentState = !isEmpty(appointment) ? appointment : initialState;
  const [selectedService, setSelectedService] = useState(appointmentState.serviceUuid);

  return (
    <>
      <div>
        <AppointmentsHeader title={t('clinicalAppointments', 'Clinical Appointments')} />
        <div className={styles.calendarTitle}>
          <h3 className={styles.productiveHeading02}>{t('calendar', 'Calendar')}</h3>
          <div className={styles['right-justified-items']}>
            <div className={styles['date-and-location']}>
              <Select
                id="service"
                invalidText="Required"
                labelText={t('selectService', 'Select a service')}
                light
                className={styles.inputContainer}
                onChange={(event) => setSelectedService(event.target.value)}
                value={selectedService}>
                {!selectedService || selectedService == '--' ? (
                  <SelectItem text={t('chooseService', 'Select service')} value="" />
                ) : null}
                {services?.length > 0 &&
                  services.map((service) => (
                    <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
                      {service.name}
                    </SelectItem>
                  ))}
              </Select>
            </div>
          </div>
        </div>
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
const events = [
  {
    title: 'Dr John Doe',
    start: '2022-11-15 14:20:00',
    end: '2022-11-15 14:30:00',
  },
  {
    title: 'HIV Consultation 3',
    start: '2022-11-14 04:00:00',
    end: '2022-11-14 04:40:00',
  },
  {
    title: 'Lab Test 5',
    start: '2022-11-09 01:50:00',
    end: '2022-11-09 02:40:00',
  },
  {
    title: 'Walkin Appointment',
    start: '2022-11-13 03:20:00',
    end: '2022-11-13 03:40:00',
  },
  {
    title: 'Scheduled Appointment',
    start: '2022-11-06 04:00:00',
    end: '2022-11-06 04:40:00',
  },
  {
    title: 'Walkin Apppointment',
    start: '2021-10-10 06:50:00',
    end: '2021-10-10 07:40:00',
  },
];
