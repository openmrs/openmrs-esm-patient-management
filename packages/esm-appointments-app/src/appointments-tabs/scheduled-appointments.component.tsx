import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useQueues } from '../patient-queue/visit-form/useVisit';
import { useSession } from '@openmrs/esm-framework';
import useAppointmentList from '../hooks/useAppointmentList';
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
  const { appointments, isLoading } = useAppointments();
  const [scheduleType, setScheduleType] = useState<scheduleType>('Scheduled');
  const { appointmentList } = useAppointmentList(scheduleType);
  const isDateInPast = !dayjs(appointmentDate).isBefore(dayjs(), 'date');
  const filteredAppointments = appointmentServiceType
    ? appointments.filter(({ serviceUuid }) => serviceUuid === appointmentServiceType)
    : appointments;
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
      <ContentSwitcher className={styles.switcher} size="sm" onChange={({ name }) => setScheduleType(name)}>
        <Switch name={'Scheduled'} text={t('scheduled', 'Scheduled')} />
        <Switch name={'Honoured'} text={t('honored', 'Honored')} />
        <Switch name={'Pending'} text={isDateInPast ? t('notArrived', 'Not arrived') : t('missed', 'Missed')} />
      </ContentSwitcher>
      <div className={styles.container}>
        {scheduleType === 'Scheduled' && (
          <AppointmentsBaseTable
            appointments={filteredAppointments}
            isLoading={isLoading}
            tableHeading={t('scheduled', 'Scheduled')}
            visits={visits}
          />
        )}
        {scheduleType === 'CameEarly' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={t('cameEarly', 'Came Early')}
            visits={visits}
          />
        )}
        {scheduleType === 'Honoured' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={t('honored', 'Honored')}
            visits={visits}
          />
        )}
        {scheduleType === 'Rescheduled' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={t('rescheduled', 'Rescheduled')}
            visits={visits}
          />
        )}
        {scheduleType === 'Pending' && (
          <AppointmentsBaseTable
            appointments={filteredRow}
            isLoading={isLoading}
            tableHeading={isDateInPast ? t('notArrived', 'Not arrived') : t('missed', 'Missed')}
            visits={visits}
          />
        )}
      </div>
    </>
  );
};

export default ScheduledAppointments;
