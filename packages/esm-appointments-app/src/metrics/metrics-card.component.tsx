import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash-es';
import { useSelectedDateContext } from '../hooks/selected-date-context';
import styles from './metrics-card.scss';
dayjs.extend(isSameOrBefore);

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  count?: { pendingAppointments: Array<any>; arrivedAppointments: Array<any> };
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, count }) => {
  const { t } = useTranslation();
  const { selectedDate } = useSelectedDateContext();
  const isSelectedDateInPast = useMemo(() => dayjs(selectedDate).isBefore(dayjs(), 'date'), [selectedDate]);

  return (
    <article className={styles.container}>
      <div className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <span className={styles.headerLabel}>{headerLabel}</span>
          </div>
        </div>
        <div className={styles.metricsGrid}>
          <div>
            <span className={styles.totalsLabel}>{label}</span>
            <p className={styles.totalsValue}>{value}</p>
          </div>
          {!isEmpty(count) && (
            <div className={styles.countGrid}>
              <span>{t('checkedIn', 'Checked in')}</span>
              <span>{isSelectedDateInPast ? t('missed', 'Missed') : t('notArrived', 'Not arrived')}</span>
              <p style={{ color: '#22651B' }}>{count.arrivedAppointments?.length}</p>
              <p style={{ color: '#da1e28' }}>{count.pendingAppointments?.length}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default MetricsCard;
