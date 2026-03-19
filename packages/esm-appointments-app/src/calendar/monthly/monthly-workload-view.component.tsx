import React, { useMemo, useState, useCallback } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { Modal } from '@carbon/react';
import { User } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import { useAppointmentsStore } from '../../store';
import AppointmentsList from '../../appointments/scheduled/appointments-list.component';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events, showAllServices = false }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedDate } = useAppointmentsStore(); // ✅ replaces useSelectedDate()

  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedDate = useMemo(() => dateTime.format('YYYY-MM-DD'), [dateTime]);
  const formattedDisplayDate = useMemo(() => dateTime.format('DD MMM YYYY'), [dateTime]);

  const isCurrentMonth = useMemo(() => isSameMonth(dateTime, dayjs(selectedDate)), [dateTime, selectedDate]);

  const serviceLimit = layout === 'small-desktop' ? 2 : 4;

  const currentData = useMemo(() => {
    return events?.find((event) => dayjs(event.appointmentDate).format('YYYY-MM-DD') === formattedDate);
  }, [events, formattedDate]);

  const services = useMemo(() => currentData?.services ?? [], [currentData]);

  const visibleServices = useMemo(() => {
    if (showAllServices) return services;
    return services.slice(0, serviceLimit);
  }, [services, showAllServices, serviceLimit]);

  const hasHiddenServices = useMemo(() => {
    if (showAllServices) return false;
    return services.length > serviceLimit;
  }, [services.length, showAllServices, serviceLimit]);

  const totalAppointments = useMemo(() => {
    return services.reduce((sum, { count = 0 }) => sum + count, 0);
  }, [services]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        openModal();
      }
    },
    [openModal],
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openModal}
        onKeyDown={handleKeyDown}
        className={classNames(
          styles[isCurrentMonth ? 'monthly-cell' : 'monthly-cell-disabled'],
          !showAllServices && {
            [styles.smallDesktop]: layout === 'small-desktop',
            [styles.largeDesktop]: layout !== 'small-desktop',
          },
        )}>
        {isCurrentMonth && (
          <div>
            <span className={styles.totals}>
              {services.length > 0 ? (
                <div role="button" tabIndex={0}>
                  <User size={16} />
                  <span>{totalAppointments}</span>
                </div>
              ) : (
                <div />
              )}
              <b className={styles.calendarDate}>{dateTime.format('D')}</b>
            </span>

            {services.length > 0 && (
              <div className={styles.currentData}>
                {visibleServices.map(({ serviceName, serviceUuid, count }, index) => (
                  <div
                    key={`${serviceUuid}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.serviceArea}>
                    <span>{serviceName}</span>
                    <span>{count}</span>
                  </div>
                ))}

                {hasHiddenServices && (
                  <MonthlyWorkloadViewExpanded
                    count={services.length - serviceLimit}
                    events={events}
                    dateTime={dateTime}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal
          open={isModalOpen}
          modalHeading={t('appointmentsFor', 'Appointments for {{date}}', { date: formattedDisplayDate })}
          passiveModal
          onRequestClose={closeModal}>
          <AppointmentsList date={dateTime.format('YYYY-MM-DDTHH:mm:ss.SSSZZ')} />
        </Modal>
      )}
    </>
  );
};

export default MonthlyWorkloadView;