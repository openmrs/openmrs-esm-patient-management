import { User } from '@carbon/react/icons';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useMemo } from 'react';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from '../monthly/monthly-view-workload.scss';

interface WeeklyWorkloadCellProps {
  dateTime: Dayjs;
  events: Array<DailyAppointmentsCountByService>;
}

const MAX_VISIBLE_PATIENTS = 3;

const WeeklyWorkloadCell: React.FC<WeeklyWorkloadCellProps> = ({ dateTime, events }) => {
  const layout = useLayoutType();

  const currentData = useMemo(
    () => events?.find((e) => dayjs(e.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD')),
    [dateTime, events],
  );

  const totalCount = currentData?.services?.reduce((sum, { count = 0 }) => sum + count, 0) ?? 0;
  const isToday = dayjs(dateTime).isSame(dayjs(), 'day');

  const formattedDate = dayjs(dateTime).startOf('day').toISOString();
  const { appointmentList: fetchedAppointments } = useAppointmentList(formattedDate);

  const patientAppointments = useMemo(() => {
    if (totalCount === 0) return [];
    return [...fetchedAppointments].sort((a, b) => dayjs(a.startDateTime).diff(dayjs(b.startDateTime)));
  }, [fetchedAppointments, totalCount]);

  const visiblePatients = patientAppointments.slice(0, MAX_VISIBLE_PATIENTS);
  const hiddenPatientCount = patientAppointments.length - MAX_VISIBLE_PATIENTS;

  const openDayModal = (serviceUuid?: string) => {
    const dispose = showModal('day-view-modal', {
      dateTime,
      serviceUuid,
      closeModal: () => dispose(),
    });
  };

  return (
    <div onClick={() => openDayModal()} className={classNames(styles['monthly-cell'], styles.largeDesktop)}>
      <span className={styles.totals}>
        {totalCount > 0 ? (
          <div role="button" tabIndex={0}>
            <User size={16} />
            <span>{totalCount}</span>
          </div>
        ) : (
          <div />
        )}
        <b className={classNames(styles.calendarDate, { [styles.todayDate]: isToday })}>{dateTime.format('D')}</b>
      </span>

      {visiblePatients.length > 0 && (
        <div className={styles.currentData}>
          {visiblePatients.map((appt) => (
            <div
              key={appt.uuid}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                openDayModal(appt.service?.uuid);
              }}
              className={styles.patientRow}>
              <span className={styles.patientName}>{appt.patient?.name}</span>
              <span className={styles.patientTime}>{dayjs(appt.startDateTime).format('HH:mm')}</span>
            </div>
          ))}

          {hiddenPatientCount > 0 && (
            <button
              className={styles.showMoreItems}
              onClick={(e) => {
                e.stopPropagation();
                openDayModal();
              }}>
              +{hiddenPatientCount} more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyWorkloadCell;
