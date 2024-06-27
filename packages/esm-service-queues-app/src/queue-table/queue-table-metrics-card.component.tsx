import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { useQueueEntriesMetrics } from '../hooks/useQueueEntries';
import styles from './queue-table-metrics-card.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface QueueTableMetricsCardProps {
  value?: number;
  queueUuid?: string;
  status?: string;
  headerLabel: string;
  children?: React.ReactNode;
  linkTo?: string;
}

const QueueTableMetricsCard: React.FC<QueueTableMetricsCardProps> = ({
  value,
  queueUuid,
  status,
  headerLabel,
  children,
  linkTo,
}) => {
  const { t } = useTranslation();
  const { count } = useQueueEntriesMetrics({
    queue: queueUuid,
    status: status,
    isEnded: false,
  });

  return (
    <Layer
      className={classNames(styles.container, {
        [styles.cardWithChildren]: children,
      })}>
      <Tile className={styles.tileContainerWithoutBorder}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            {linkTo ? (
              <label className={styles.headerLabel}>
                <ConfigurableLink to={linkTo}>{headerLabel}</ConfigurableLink>
              </label>
            ) : (
              <label className={styles.headerLabel}>{headerLabel}</label>
            )}
            {children}
          </div>
        </div>
        <div>
          <label className={styles.valueLabel}>{!isNaN(value) ? value : count}</label>
        </div>
      </Tile>
    </Layer>
  );
};

export default QueueTableMetricsCard;
