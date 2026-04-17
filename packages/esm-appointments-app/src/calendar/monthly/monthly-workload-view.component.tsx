import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from './monthly-view-workload.scss';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import { showModal, useLayoutType } from '@openmrs/esm-framework';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

const MAX_VISIBLE_PATIENTS = 3;

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events, showAllServices = false }) => {
  const layout = useLayoutType();
  const selectedDate = useSelectedDate();

  const currentData = useMemo(
    () =>
      events?.find(
        (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
      ),
    [dateTime, events],
  );

  const isCurrentMonth = isSameMonth(dateTime, dayjs(selectedDate));
  const totalCount = currentData?.services?.reduce((sum, { count = 0 }) => sum + count, 0) ?? 0;

  // Only fetch for cells in current month that have appointments
  const formattedDate = dayjs(dateTime).startOf('day').toISOString();
  const { appointmentList: fetchedAppointments } = useAppointmentList(formattedDate);

  const patientAppointments = useMemo(() => {
    if (!isCurrentMonth || totalCount === 0) return [];
    return [...fetchedAppointments].sort((a, b) => dayjs(a.startDateTime).diff(dayjs(b.startDateTime)));
  }, [fetchedAppointments, isCurrentMonth, totalCount]);

  const visiblePatients = patientAppointments.slice(0, MAX_VISIBLE_PATIENTS);
  const hiddenPatientCount = patientAppointments.length - MAX_VISIBLE_PATIENTS;

  const hasHiddenServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return false;
      return layout === 'small-desktop' ? currentData.services.length > 2 : currentData.services.length > 4;
    }
    return false;
  }, [currentData?.services, layout, showAllServices]);

  const openDayModal = (serviceUuid?: string) => {
    const dispose = showModal('day-view-modal', {
      dateTime,
      serviceUuid,
      closeModal: () => dispose(),
    });
  };

  return (
    <div
      onClick={() => openDayModal()}
      className={classNames(
        styles[isCurrentMonth ? 'monthly-cell' : 'monthly-cell-disabled'],
        showAllServices
          ? {}
          : {
              [styles.smallDesktop]: layout === 'small-desktop',
              [styles.largeDesktop]: layout !== 'small-desktop',
            },
      )}>
      {isCurrentMonth && (
        <div>
          <span className={classNames(styles.totals)}>
            {totalCount > 0 ? (
              <div role="button" tabIndex={0}>
                <User size={16} />
                <span>{totalCount}</span>
              </div>
            ) : (
              <div />
            )}
            <b className={styles.calendarDate}>{dateTime.format('D')}</b>
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

              {hasHiddenServices && currentData && (
                <MonthlyWorkloadViewExpanded
                  count={currentData.services.length - (layout === 'small-desktop' ? 2 : 4)}
                  events={events}
                  dateTime={dateTime}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyWorkloadView;
