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
import useSWR from 'swr';

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
  const [selectedTab, setSelectedTab] = useState(0);
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
          <Tab>{t('monthly', 'Monthly')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>{<MonthlyCalendarView type="monthly" events={events} />}</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default CalendarView;
const events = [
  {
    appointmentDate: '2022-12-30 05:20:00',
    service: [
      { serviceName: 'HIV', count: 10 },
      { serviceName: 'Lab testing', count: 7 },
      { serviceName: 'Refill', count: 15 },
    ],
  },
  {
    appointmentDate: '2022-12-28 10:20:00',
    service: [
      { serviceName: 'HIV', count: 5 },
      { serviceName: 'Lab testing', count: 3 },
      { serviceName: 'Refill', count: 1 },
    ],
  },
  {
    appointmentDate: '2022-11-24 09:20:00',
    service: [
      { serviceName: 'Test', count: 10 },
      { serviceName: 'Lab testing', count: 10 },
    ],
  },
  {
    appointmentDate: '2022-11-21 10:00:00',
    service: [
      { serviceName: 'HIV', count: 1 },
      { serviceName: 'Lab testing', count: 1 },
      { serviceName: 'Refill', count: 1 },
    ],
  },
  {
    appointmentDate: '2022-11-18 08:20:00',
    service: [
      { serviceName: 'HIV', count: 21 },
      { serviceName: 'Drug Pickup', count: 4 },
      { serviceName: 'Lab testing', count: 10 },
      { serviceName: 'Refill', count: 3 },
    ],
  },
  {
    appointmentDate: '2022-11-14 12:20:00',
    service: [
      { serviceName: 'HIV', count: 10 },
      { serviceName: 'Refill', count: 2 },
    ],
  },
  {
    appointmentDate: '2022-11-11 14:20:00',
    service: [
      { serviceName: 'HIV', count: 1 },
      { serviceName: 'Lab testing', count: 10 },
    ],
  },
  {
    appointmentDate: '2022-11-08 13:20:00',
    service: [
      { serviceName: 'HIV', count: 10 },
      { serviceName: 'Lab testing', count: 10 },
      { serviceName: 'Refill', count: 15 },
    ],
  },
  {
    appointmentDate: '2022-10-27 15:20:00',
    service: [
      { serviceName: 'HIV', count: 1 },
      { serviceName: 'Drug pickup', count: 4 },
      { serviceName: 'Refill', count: 1 },
    ],
  },
  {
    appointmentDate: '2022-10-22 17:20:00',
    service: [{ serviceName: 'HIV', count: 13 }],
  },
];
