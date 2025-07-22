import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';
import { type ConfigObject } from '../../config-schema';

interface MetricsCardProps {
  label: string;
  value: number | string;
  headerLabel: string;
  children?: React.ReactNode;
  service?: string;
  serviceUuid?: string;
  locationUuid?: string;
  showUrgent?: boolean;
  urgentCount?: number;
  inConsultation?: number;
  unScheduled?: number;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  label,
  value,
  headerLabel,
  children,
  service,
  serviceUuid,
  locationUuid,
  showUrgent,
  urgentCount,
  inConsultation,
  unScheduled,
}) => {
  const { t } = useTranslation();
  const { showPatientSeenCard } = useConfig<ConfigObject>();
  const queueListPath =
    window.getOpenmrsSpaBase() + `home/service-queues/queue-list/${service}/${serviceUuid}/${locationUuid}`;

  return (
    <Layer
      className={classNames({
        cardWithChildren: children,
      })}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
          {service == 'scheduled' ? (
            <div className={styles.link}>
              <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/home`}>
                {t('patientList', 'Patient list')}
              </ConfigurableLink>
              <ArrowRight size={16} />
            </div>
          ) : service == 'waitTime' ? null : (
            <div className={styles.link}>
              <ConfigurableLink className={styles.link} to={queueListPath}>
                {t('patientList', 'Patient list')}
              </ConfigurableLink>
              <ArrowRight size={16} />
            </div>
          )}
        </div>
        <div className={styles.metricsContainer}>
          <div className={styles.metricItem}>
            <label className={styles.totalsLabel}>{label}</label>
            <p className={styles.totalsValue}>{value}</p>
          </div>
          {showUrgent && (
            <div className={styles.metricItem}>
              <label className={styles.urgentLabel}>{t('urgent', 'Urgent')}</label>
              <p className={styles.urgentValue}>{urgentCount ?? '0'}</p>
            </div>
          )}
          {showPatientSeenCard && (
            <>
              <div className={styles.metricItem}>
                <label className={styles.urgentLabel}>{t('inConsultation', 'In consultation')}</label>
                <p className={styles.totalsValue}>{inConsultation}</p>
              </div>
              <div className={styles.metricItem}>
                <label className={styles.urgentLabel}>{t('unScheduled', 'Unscheduled')}</label>
                <p className={styles.totalsValue}>{unScheduled ?? '0'}</p>
              </div>
            </>
          )}
        </div>
      </Tile>
    </Layer>
  );
};

export default MetricsCard;
