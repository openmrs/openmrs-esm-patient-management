import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useQueues } from '../patient-queue/visit-form/useVisit';
import { useSession } from '@openmrs/esm-framework';
import { useAppointmentList, useEarlyAppointmentList } from '../hooks/useAppointmentList';
import AppointmentsBaseTable from './appointments-base-table.component';
import { useAppointmentDate } from '../helpers';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import styles from './scheduled-appointments.scss';

interface ScheduledAppointmentsProps {
  visits: Array<any>;
  isLoading: boolean;
  appointmentServiceType?: string;
}
type scheduleType = 'CameEarly' | 'Rescheduled' | 'Honoured' | 'Pending' | 'Scheduled';

const ScheduledAppointments: React.FC<ScheduledAppointmentsProps> = ({
  isLoading: isLoadingVisit,
  visits,
  appointmentServiceType,
}) => {
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
        {scheduleType === 'Scheduled' && (
          <AppointmentsBaseTable
            appointments={filteredAppointments}
            isLoading={isLoading}
            tableHeading={t('scheduled', 'Scheduled')}
            visits={visits}
            scheduleType={scheduleType}
          />
        )}
        {scheduleType === 'CameEarly' && (
          <AppointmentsBaseTable
            appointments={earlyAppointmentList}
            isLoading={loading}
            tableHeading={t('cameEarly', 'Came early')}
            visits={visits}
            scheduleType={scheduleType}
          />
        )}
        {scheduleType === 'Honoured' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={t('honored', 'Honored')}
            visits={visits}
            scheduleType={scheduleType}
          />
        )}
        {scheduleType === 'Rescheduled' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={t('rescheduled', 'Rescheduled')}
            visits={visits}
            scheduleType={scheduleType}
          />
        )}
        {scheduleType === 'Pending' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={isDateInPast ? t('notArrived', 'Not arrived') : t('missed', 'Missed')}
            visits={visits}
            scheduleType={scheduleType}
          />
        )}
      </div>
    </>
  );
};

export default ScheduledAppointments;
