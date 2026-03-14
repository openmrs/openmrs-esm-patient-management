import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events, showAllServices = false }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const selectedDate = useSelectedDate();
  const [modalOpen, setModalOpen] = useState(false);

  const currentData = useMemo(
    () =>
      events?.find(
        (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
      ),
    [dateTime, events],
  );

  const visibleServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return currentData.services;
      return currentData.services.slice(0, layout === 'small-desktop' ? 2 : 4);
    }
    return [];
  }, [currentData, showAllServices, layout]);

  const hasHiddenServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return false;
      return layout === 'small-desktop' ? currentData.services.length > 2 : currentData.services.length > 4;
    }
    return false;
  }, [currentData?.services, layout, showAllServices]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => isSameMonth(dateTime, dayjs(selectedDate)) && setModalOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && isSameMonth(dateTime, dayjs(selectedDate)) && setModalOpen(true)}
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
            {currentData?.services && (
              <div className={styles.currentData}>
                {visibleServices.map(({ serviceName, serviceUuid, count }, i) => (
                  <div
                    key={`${serviceUuid}-${count}-${i}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpen(true);
                    }}
                    className={styles.serviceArea}>
                    <span>{serviceName}</span>
                    <span>{count}</span>
                  </div>
                ))}
                {hasHiddenServices ? (
                  <MonthlyWorkloadViewExpanded
                    count={currentData.services.length - (layout === 'small-desktop' ? 2 : 4)}
                    events={events}
                    dateTime={dateTime}
                  />
                ) : (
                  ''
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          open={modalOpen}
          modalHeading={`${t('appointments', 'Appointments')} — ${dateTime.format('dddd, MMMM D YYYY')}`}
          passiveModal
          onRequestClose={() => setModalOpen(false)}>
          {currentData?.services?.length ? (
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>{t('service', 'Service')}</th>
                  <th>{t('count', 'Count')}</th>
                </tr>
              </thead>
              <tbody>
                {currentData.services.map(({ serviceName, serviceUuid, count }) => (
                  <tr key={serviceUuid}>
                    <td>{serviceName}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{t('noAppointmentsForDay', 'No appointments scheduled for this day.')}</p>
          )}
        </Modal>
      )}
    </>
  );
};

export default MonthlyWorkloadView;
