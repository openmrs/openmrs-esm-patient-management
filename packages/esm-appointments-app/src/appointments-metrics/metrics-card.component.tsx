import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metrics-card.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';
import isEmpty from 'lodash-es/isEmpty';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

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
    highVolume: 'high-volume-service',
    providers: 'providers-link',
  };

  return (
    <Tile className={styles.tileContainer}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        {view && (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/${metricsLink[view]}`}>
            <span style={{ fontSize: '0.825rem', marginRight: '0.325rem' }}>{t('view', 'View')}</span>{' '}
            <ArrowRight size={16} className={styles.viewListBtn} />
          </ConfigurableLink>
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
  );
};

export default MetricsCard;
