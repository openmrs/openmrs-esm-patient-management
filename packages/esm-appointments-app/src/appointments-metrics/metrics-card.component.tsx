import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import isEmpty from 'lodash-es/isEmpty';
import { Tile, Layer } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
  view: string;
  count?: { pendingAppointments: Array<any>; arrivedAppointments: Array<any> };
  appointmentDate?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  label,
  value,
  headerLabel,
  children,
  view,
  count,
  appointmentDate,
}) => {
  const { t } = useTranslation();
  const isDateInPast = useMemo(() => !dayjs(appointmentDate).isBefore(dayjs(), 'date'), [appointmentDate]);

  const metricsLink = {
    patients: 'appointments-list/scheduled',
    highVolume: 'appointments-list/high-volume-service',
    providers: 'appointments-list/providers-link',
  };

  return (
    <Layer className={styles.container}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
          {view && (
            <div className={styles.link}>
              <ConfigurableLink
                className={styles.link}
                to={`\${openmrsSpaBase}/home/appointments/${metricsLink[view]}`}>
                <span style={{ fontSize: '0.825rem', marginRight: '0.325rem' }}>{t('view', 'View')}</span>{' '}
                <ArrowRight size={16} className={styles.viewListBtn} />
              </ConfigurableLink>
            </div>
          )}
        </div>
        <div className={styles.metricsGrid}>
          <div>
            <label className={styles.totalsLabel}>{label}</label>
            <p className={styles.totalsValue}>{value}</p>
          </div>
          {!isEmpty(count) && (
            <div className={styles.countGrid}>
              <span>{t('honored', 'Honored')}</span>
              <span>{isDateInPast ? t('notArrived', 'Not arrived') : t('missed', 'Missed')}</span>
              <p style={{ color: '#319227' }}>{count.arrivedAppointments?.length}</p>
              <p style={{ color: '#da1e28' }}>{count.pendingAppointments?.length}</p>
            </div>
          )}
        </div>
      </Tile>
    </Layer>
  );
};

export default MetricsCard;
