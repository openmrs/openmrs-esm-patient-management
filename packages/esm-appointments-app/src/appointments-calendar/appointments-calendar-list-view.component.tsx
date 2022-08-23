import React, { useMemo, useState } from 'react';
import { useAppointment } from '../hooks/useAppointments';
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
} from '@carbon/react';
import { ArrowRight, Filter } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '@openmrs/esm-framework';
import AppointmentsHeader from '../appointments-header/appointments-header.component';
import styles from './appointments-calendar-list-view.scss';
import EmptyState from '../empty-state/empty-state.component';
import { DurationPeriod } from '../types';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../constants';

interface AppointmentsCalendarListViewProps {}

const AppointmentsCalendarListView: React.FC<AppointmentsCalendarListViewProps> = () => {
  const { t } = useTranslation();
  const currentDate = useMemo(() => dayjs(new Date().setHours(0, 0)).format(omrsDateFormat), []);
  const { appointments, isLoading } = useAppointment(currentDate);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(DurationPeriod.weekly);

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (appointments.length === 0) {
    return (
      <>
        <AppointmentsHeader title={t('clinicalAppointments', 'Clinical Appointments')} />
        <EmptyState
          displayMessage={t('appointmentsList', 'Appointment list is empty')}
          headerTitle={t('appointmentList', 'Appointments list')}
        />
      </>
    );
  }

  return (
    <div>
      <AppointmentsHeader title={t('clinicalAppointments', 'Clinical Appointments')} />
      <div className={styles.calendarTitle}>
        <h3 className={styles.productiveHeading02}>{t('calendar', 'Calendar')}</h3>
        <Button renderIcon={ArrowRight} kind="ghost">
          {t('addNewClinicDay', 'Add new clinic day')}
        </Button>
      </div>
      <div className={styles.filterContainer}>
        <Button renderIcon={Filter} kind="ghost">
          {t('filter', 'Filter')}
        </Button>

        <ContentSwitcher
          selectedIndex={selectedDurationIndex}
          style={{ maxWidth: '25rem' }}
          onChange={({ index }) => setSelectedDurationIndex(index)}>
          <Switch name={'daily'} text={t('daily', 'Daily')} />
          <Switch name={'weekly'} text={t('weekly', 'Weekly')} />
          <Switch name={'monthly'} text={t('monthly', 'Monthly')} />
        </ContentSwitcher>
      </div>
      <StructuredListWrapper className={styles.structuredListWrapper} light ariaLabel="Structured list">
        <StructuredListHead>
          <StructuredListRow head tabIndex={0}>
            <StructuredListCell head>{t('patientName', 'Patient name')}</StructuredListCell>
            <StructuredListCell head>{t('date', 'Date')}</StructuredListCell>
            <StructuredListCell head>{t('startTime', 'Start time')}</StructuredListCell>
            <StructuredListCell head>{t('endTime', 'End time')}</StructuredListCell>
            <StructuredListCell head>{t('provider', 'Provider')}</StructuredListCell>
            <StructuredListCell head>{t('service', 'Service')}</StructuredListCell>
            <StructuredListCell head>{t('comments', 'Comments')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {appointments.map((appointment: any) => (
            <StructuredListRow key={appointment.uuid} tabIndex={0}>
              <StructuredListCell>{appointment.patient.name}</StructuredListCell>
              <StructuredListCell>
                {formatDate(new Date(appointment.startDateTime), { mode: 'standard' })}
              </StructuredListCell>
              <StructuredListCell>{formatTime(new Date(appointment.startDateTime))}</StructuredListCell>
              <StructuredListCell>{formatTime(new Date(appointment.endDateTime))}</StructuredListCell>
              <StructuredListCell>{appointment.provider?.name ?? '--'}</StructuredListCell>
              <StructuredListCell>{appointment.service.name}</StructuredListCell>
              <StructuredListCell>{appointment.comments}</StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
};

export default AppointmentsCalendarListView;
