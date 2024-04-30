import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from '../patient-queue-metrics/metrics-card.scss';

interface QueueTableMetricsCardProps {
  value: number | string;
  headerLabel: string;
  children?: React.ReactNode;
}

const QueueTableMetricsCard: React.FC<QueueTableMetricsCardProps> = ({ value, headerLabel, children }) => {
  const { t } = useTranslation();

  return (
    <Layer
      className={classNames(styles.container, {
        [styles.cardWithChildren]: children,
      })}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
        </div>
        <div className={styles.link}>
          <ConfigurableLink className={styles.link} to={''}>
            {value}
          </ConfigurableLink>
        </div>
      </Tile>
    </Layer>
  );
};

export default QueueTableMetricsCard;
