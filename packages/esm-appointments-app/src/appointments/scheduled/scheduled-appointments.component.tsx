import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useAppointmentList, useEarlyAppointmentList } from '../../hooks/useAppointmentList';
import { useAppointmentDate } from '../../helpers';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import styles from './scheduled-appointments.scss';
import AppointmentsBaseTable from '../common-components/appointments-base-table.component';

interface ScheduledAppointmentsProps {
  visits: Array<any>;
  isLoading: boolean;
  appointmentServiceType?: string;
}
type scheduleType = 'CameEarly' | 'Rescheduled' | 'Honoured' | 'Pending' | 'Scheduled';

const ScheduledAppointments: React.FC<ScheduledAppointmentsProps> = ({ visits, appointmentServiceType }) => {
  const { t } = useTranslation();
  const appointmentDate = useAppointmentDate();
  const [scheduleType, setScheduleType] = useState<scheduleType>('Scheduled');
  const { appointmentList, isLoading } = useAppointmentList(scheduleType);
  const { earlyAppointmentList, isLoading: loading } = useEarlyAppointmentList();
  const isDateInPast = dayjs(appointmentDate).isBefore(dayjs(), 'date');
  const isDateInFuture = dayjs(appointmentDate).isAfter(dayjs(), 'date');
  const isToday = dayjs(appointmentDate).isSame(dayjs(), 'date');

  const filteredAppointments = appointmentServiceType
    ? appointmentList.filter(({ serviceTypeUuid }) => serviceTypeUuid === appointmentServiceType)
    : appointmentList;
  const rowData = appointmentList.map((appointment, index) => {
    return {
      id: `${index}`,
      ...appointment,
    };
  });
  const filteredRow = appointmentServiceType
    ? rowData.filter((app) => app.serviceTypeUuid === appointmentServiceType)
    : rowData;

  const appointmentsBaseTableConfig = {
    Scheduled: {
      appointments: filteredAppointments,
      isLoading,
      tableHeading: t('scheduled', 'Scheduled'),
      visits,
      scheduleType,
    },
    CameEarly: {
      appointments: earlyAppointmentList,
      isLoading: loading,
      tableHeading: t('cameEarly', 'Came early'),
      visits,
      scheduleType,
    },
    Honoured: {
      appointments: filteredRow,
      isLoading,
      tableHeading: t('honored', 'Honored'),
      visits,
      scheduleType,
    },
    Rescheduled: {
      appointments: filteredRow,
      isLoading,
      tableHeading: t('rescheduled', 'Rescheduled'),
      visits,
      scheduleType,
    },
    Pending: {
      appointments: filteredRow,
      isLoading,
      tableHeading: isDateInPast ? t('notArrived', 'Not arrived') : t('missed', 'Missed'),
      visits,
      scheduleType,
    },
  };

  const currentConfig = appointmentsBaseTableConfig[scheduleType];

  return (
    <>
      {isToday && (
        <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setScheduleType(name)}>
          <Switch name={'Scheduled'} text={t('scheduled', 'Scheduled')} />
          <Switch name={'Honoured'} text={t('honored', 'Honored')} />
          <Switch name={'Pending'} text={t('notArrived', 'Not arrived')} />
          <Switch name={'CameEarly'} text={t('cameEarly', 'Came early')} />
        </ContentSwitcher>
      )}
      {isDateInPast && (
        <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setScheduleType(name)}>
          <Switch name={'Scheduled'} text={t('scheduled', 'Scheduled')} />
          <Switch name={'Honoured'} text={t('honored', 'Honored')} />
          <Switch name={'Pending'} text={t('missed', 'Missed')} />
        </ContentSwitcher>
      )}
      {isDateInFuture && (
        <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setScheduleType(name)}>
          <Switch name={'Scheduled'} text={t('scheduled', 'Scheduled')} />
        </ContentSwitcher>
      )}
      <div className={styles.container}>
        <AppointmentsBaseTable {...currentConfig} />
      </div>
    </>
  );
};

export default ScheduledAppointments;
