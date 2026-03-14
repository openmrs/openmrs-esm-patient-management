import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { Modal } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type DailyAppointmentsCountByService } from '../../types';
import { useAppointmentsStore } from '../../store';
import styles from './weekly-calendar-view.scss';

interface WeeklyWorkloadViewProps {
  dateTime: Dayjs;
  events: Array<DailyAppointmentsCountByService>;
}

const WeeklyWorkloadView: React.FC<WeeklyWorkloadViewProps> = ({ dateTime, events }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const [modalOpen, setModalOpen] = useState(false);

  const isToday = dateTime.isSame(dayjs(), 'day');
  const isSelected = dateTime.isSame(dayjs(selectedDate), 'day');

  const currentData = useMemo(
    () => events?.find((e) => dayjs(e.appointmentDate).format('YYYY-MM-DD') === dateTime.format('YYYY-MM-DD')),
    [dateTime, events],
  );

  const totalCount = currentData?.services?.reduce((sum, { count = 0 }) => sum + count, 0) ?? 0;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={classNames(styles.dayCell, {
          [styles.today]: isToday,
          [styles.selected]: isSelected,
          [styles.hasData]: !!currentData,
        })}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}>
        {currentData?.services ? (
          <>
            <div className={styles.totalCount}>
              <User size={14} />
              <span>{totalCount}</span>
            </div>
            <div className={styles.serviceList}>
              {currentData.services.map(({ serviceName, serviceUuid, count }) => (
                <div key={serviceUuid} className={styles.serviceRow}>
                  <span className={styles.serviceName}>{serviceName}</span>
                  <span className={styles.serviceCount}>{count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <span className={styles.emptyCell}>{t('noAppointments', 'No appointments')}</span>
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

export default WeeklyWorkloadView;
