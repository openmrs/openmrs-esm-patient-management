import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { isSameMonth } from '../../helpers';
import { type Appointment, type DailyAppointmentsCountByService, AppointmentStatus } from '../../types';
import { useAppointmentsStore } from '../../store';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  appointments: Array<Appointment>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

const statusColorMap: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: '#005D5D',
  [AppointmentStatus.CANCELLED]: '#DA1E28',
  [AppointmentStatus.MISSED]: '#FF832B',
  [AppointmentStatus.CHECKEDIN]: '#0043CE',
  [AppointmentStatus.COMPLETED]: '#198038',
};

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({
  dateTime,
  events,
  appointments,
  showAllServices = false,
}) => {
  const layout = useLayoutType();
  const { selectedDate } = useAppointmentsStore();

  const currentData = useMemo(
    () =>
      events?.find(
        (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
      ),
    [dateTime, events],
  );

  const navigateToAppointmentsByDate = (serviceUuid: string) => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(dateTime).format('YYYY-MM-DD')}/${serviceUuid}` });
  };

  const dayAppointments = useMemo(
    () =>
      appointments?.filter((apt) => dayjs(apt.startDateTime).format('YYYY-MM-DD') === dateTime.format('YYYY-MM-DD')) ??
      [],
    [appointments, dateTime],
  );

  const maxVisible = layout === 'small-desktop' ? 2 : 3;
  const visibleAppointments = showAllServices ? dayAppointments : dayAppointments.slice(0, maxVisible);
  const hiddenCount = dayAppointments.length - visibleAppointments.length;

  return (
    <div
      onClick={() => navigateToAppointmentsByDate('')}
      className={classNames(
        styles[isSameMonth(dateTime, dayjs(selectedDate)) ? 'monthly-cell' : 'monthly-cell-disabled'],
        showAllServices
          ? {}
          : {
              [styles.smallDesktop]: layout === 'small-desktop',
              [styles.largeDesktop]: layout !== 'small-desktop',
            },
      )}>
      {isSameMonth(dateTime, dayjs(selectedDate)) && (
        <div>
          <span className={classNames(styles.totals)}>
            {currentData?.services ? (
              <div role="button" tabIndex={0}>
                <User size={16} />
                <span>{currentData?.services.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
              </div>
            ) : (
              <div />
            )}
            <b className={styles.calendarDate}>{dateTime.format('D')}</b>
          </span>

          <div className={styles.currentData}>
            {visibleAppointments.map((apt) => (
              <div
                key={apt.uuid}
                className={styles.serviceArea}
                style={{
                  borderLeft: `3px solid ${statusColorMap[apt.status] ?? '#005D5D'}`,
                  paddingLeft: '4px',
                }}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToAppointmentsByDate('');
                }}>
                <span>{dayjs(apt.startDateTime).format('h:mm a')}</span>
                <span>{apt.patient.name}</span>
              </div>
            ))}

            {hiddenCount > 0 ? (
              <MonthlyWorkloadViewExpanded
                count={hiddenCount}
                events={events}
                dateTime={dateTime}
                appointments={appointments}
              />
            ) : (
              ''
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyWorkloadView;
