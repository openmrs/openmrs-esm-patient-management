import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import isEmpty from 'lodash-es/isEmpty';
import styles from './metrics-card.scss';
import SelectedDateContext from '../hooks/selectedDateContext';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  count?: { pendingAppointments: Array<any>; arrivedAppointments: Array<any> };
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, count }) => {
  const { t } = useTranslation();
  const { selectedDate } = useContext(SelectedDateContext);
  const isSelectedDateInPast = useMemo(() => dayjs(selectedDate).isBefore(dayjs(), 'date'), [selectedDate]);

  return (
    <article className={styles.container}>
      <div className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
          </div>
        </div>
        <div className={styles.metricsGrid}>
          <div>
            <label className={styles.totalsLabel}>{label}</label>
            <p className={styles.totalsValue}>{value}</p>
          </div>
          {!isEmpty(count) && (
            <div className={styles.countGrid}>
              <span>{t('checkedIn', 'Checked in')}</span>
              <span>{isSelectedDateInPast ? t('missed', 'Missed') : t('notArrived', 'Not arrived')}</span>
              <p style={{ color: '#319227' }}>{count.arrivedAppointments?.length}</p>
              <p style={{ color: '#da1e28' }}>{count.pendingAppointments?.length}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default MetricsCard;
