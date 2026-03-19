import React, { useState } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { type DailyAppointmentsCountByService } from '../../types';
import { useAppointmentsStore } from '../../store';
import AppointmentSummaryModal from '../shared/appointment-summary-modal.component';
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
  const currentData = events?.find(
    (e) => dayjs(e.appointmentDate).format('YYYY-MM-DD') === dateTime.format('YYYY-MM-DD'),
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
        onClick={() => currentData && setModalOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && currentData && setModalOpen(true)}>
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
        <AppointmentSummaryModal
          open={modalOpen}
          heading={`${t('appointments', 'Appointments')} — ${dateTime.format('dddd, MMMM D YYYY')}`}
          services={currentData?.services}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default WeeklyWorkloadView;
