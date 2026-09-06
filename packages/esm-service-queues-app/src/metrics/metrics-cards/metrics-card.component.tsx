import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  children?: React.ReactNode;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ children }) => {
  return (
    <Layer>
      <Tile className={styles.tileContainer}>{children}</Tile>
    </Layer>
  );
};

interface MetricsCardHeaderProps {
  title: string;
  link?: string;
  linkText?: string;
}

export const MetricsCardHeader: React.FC<MetricsCardHeaderProps> = ({ title, link, linkText }) => {
  return (
    <div className={styles.tileHeader}>
      <div className={styles.headerLabelContainer}>
        <label className={styles.headerLabel}>{title}</label>
      </div>
      {link && (
        <div className={styles.link}>
          <ConfigurableLink className={styles.link} to={link}>
            {linkText}
          </ConfigurableLink>
          <ArrowRight size={16} />
        </div>
      )}
    </div>
  );
};

interface MetricsCardBodyProps {
  children?: React.ReactNode;
}

export const MetricsCardBody: React.FC<MetricsCardBodyProps> = ({ children }) => {
  return <div className={styles.metricsContainer}>{children}</div>;
};

interface MetricsCardItemProps {
  /** If the value is null, the item will not be rendered. */
  value: number | string | null;
}

export const MetricsCardItem: React.FC<MetricsCardItemProps> = ({ value }) => {
  if (value === null) {
    return null;
  }

  return (
    <div className={styles.metricItem}>
      <p className={styles.metricValue}>{value}</p>
    </div>
  );
};
