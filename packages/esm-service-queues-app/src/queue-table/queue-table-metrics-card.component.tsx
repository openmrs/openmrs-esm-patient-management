import React from 'react';
import classNames from 'classnames';
import { Layer, Tile } from '@carbon/react';
import { useQueueEntriesMetrics } from '../hooks/useQueueEntries';
import styles from './queue-table-metrics-card.scss';

interface QueueMetricTileProps {
  value: React.ReactNode;
  headerLabel: string;
  children?: React.ReactNode;
}

/** One tile in a metrics strip, for a figure the caller already has. */
export const QueueMetricTile: React.FC<QueueMetricTileProps> = ({ value, headerLabel, children }) => {
  return (
    <Layer
      className={classNames(styles.container, {
        [styles.cardWithChildren]: children,
      })}>
      <Tile className={styles.tileContainerWithoutBorder}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
        </div>
        <div>
          <label className={styles.valueLabel}>{value}</label>
        </div>
      </Tile>
    </Layer>
  );
};

interface QueueTableMetricsCardProps {
  queueUuid?: string;
  status?: string;
  headerLabel: string;
  children?: React.ReactNode;
}

/** A tile that counts a queue and status for itself. */
const QueueTableMetricsCard: React.FC<QueueTableMetricsCardProps> = ({ queueUuid, status, headerLabel, children }) => {
  const { count } = useQueueEntriesMetrics({ queue: queueUuid, status: status, isEnded: false });

  return (
    <QueueMetricTile headerLabel={headerLabel} value={count}>
      {children}
    </QueueMetricTile>
  );
};

export default QueueTableMetricsCard;
