import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { omrsDateFormat } from '../../constants';
import { isSameMonth } from '../../helpers';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import { type DailyAppointmentsCountByService } from '../../types';
import { useAppointmentsStore } from '../../store';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import styles from './monthly-view-workload.scss';
import { showModal, useLayoutType } from '@openmrs/esm-framework';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

// How many patient names to show inline
const MAX_VISIBLE_PATIENTS = 3;

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events, showAllServices = false }) => {
  const layout = useLayoutType();
  const { selectedDate } = useAppointmentsStore();

  const currentData = useMemo(
    () =>
      events?.find(
        (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
      ),
    [dateTime, events],
  );

  const isCurrentMonth = isSameMonth(dateTime, dayjs(selectedDate));
  const totalCount = currentData?.services?.reduce((sum, { count = 0 }) => sum + count, 0) ?? 0;

  // Only fetch patient appointments for cells that belong to this month and have appointments
  const formattedDate = dayjs(dateTime).startOf('day').format(omrsDateFormat);
  const { appointmentList } = useAppointmentList('Scheduled', isCurrentMonth && totalCount > 0 ? formattedDate : null);
  const { appointmentList: checkedInList } = useAppointmentList(
    'CheckedIn',
    isCurrentMonth && totalCount > 0 ? formattedDate : null,
  );

  // Combine scheduled + checked-in, sorted by start time, for inline display
  const patientAppointments = useMemo(
    () => [...appointmentList, ...checkedInList].sort((a, b) => dayjs(a.startDateTime).diff(dayjs(b.startDateTime))),
    [appointmentList, checkedInList],
  );

  const visiblePatients = patientAppointments.slice(0, MAX_VISIBLE_PATIENTS);
  const hiddenPatientCount = patientAppointments.length - MAX_VISIBLE_PATIENTS;

  const hasHiddenServices = useMemo(() => {
    if (!currentData?.services || showAllServices) return false;
    return layout === 'small-desktop' ? currentData.services.length > 2 : currentData.services.length > 4;
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
          {/* Top row: total count (left) + date number (right) — unchanged */}
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

          {/* Patient name rows instead of service rows */}
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

              {/* Keep the expanded popover for days outside the patient list scope */}
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
