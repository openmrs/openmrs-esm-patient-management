import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@carbon/react';
import { User } from '@carbon/react/icons';
import { formatDate } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../../constants';
import { useAppointmentsStore, setSelectedDate } from '../../store';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ events }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const [modalOpen, setModalOpen] = useState(false);

  const handlePrevDay = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format(omrsDateFormat));
  }, [selectedDate]);

  const handleNextDay = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).add(1, 'day').format(omrsDateFormat));
  }, [selectedDate]);

  const currentData = useMemo(
    () =>
      events?.find((e) => dayjs(e.appointmentDate).format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD')),
    [events, selectedDate],
  );

  const totalCount = currentData?.services?.reduce((sum, { count = 0 }) => sum + count, 0) ?? 0;
  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');

  return (
    <div className={styles.dailyContainer}>
      <div className={styles.dailyHeader}>
        <Button kind="tertiary" size="sm" onClick={handlePrevDay} aria-label={t('previousDay', 'Previous day')}>
          {t('prev', 'Prev')}
        </Button>
        <div className={styles.dateDisplay}>
          <span className={styles.dayName}>{dayjs(selectedDate).format('dddd')}</span>
          <span className={styles.fullDate}>
            {formatDate(new Date(selectedDate), { day: true, time: false, noToday: true })}
          </span>
          {isToday && <span className={styles.todayBadge}>{t('today', 'Today')}</span>}
        </div>
        <Button kind="tertiary" size="sm" onClick={handleNextDay} aria-label={t('nextDay', 'Next day')}>
          {t('next', 'Next')}
        </Button>
      </div>

      <div className={styles.dailyBody}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <User size={20} />
            <span className={styles.totalLabel}>
              {t('totalAppointments', 'Total appointments')}: <strong>{totalCount}</strong>
            </span>
          </div>

          {currentData?.services?.length ? (
            <table className={styles.serviceTable}>
              <thead>
                <tr>
                  <th>{t('service', 'Service')}</th>
                  <th>{t('appointments', 'Appointments')}</th>
                </tr>
              </thead>
              <tbody>
                {currentData.services.map(({ serviceName, serviceUuid, count }) => (
                  <tr
                    key={serviceUuid}
                    role="button"
                    tabIndex={0}
                    className={styles.serviceRow}
                    onClick={() => setModalOpen(true)}
                    onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}>
                    <td>{serviceName}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>{t('noAppointmentsForDay', 'No appointments scheduled for this day.')}</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal
          open={modalOpen}
          modalHeading={`${t('appointments', 'Appointments')} — ${dayjs(selectedDate).format('dddd, MMMM D YYYY')}`}
          passiveModal
          onRequestClose={() => setModalOpen(false)}>
          {currentData?.services?.length ? (
            <table className={styles.serviceTable}>
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
    </div>
  );
};

export default DailyCalendarView;
