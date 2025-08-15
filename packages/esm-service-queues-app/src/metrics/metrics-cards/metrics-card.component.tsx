import React from 'react';
import classNames from 'classnames';
import { Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  children?: React.ReactNode;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ children }) => {
  return (
    <Layer
      className={classNames({
        cardWithChildren: children,
      })}>
      <Tile className={styles.tileContainer}>{children}</Tile>
    </Layer>
  );
};

interface MetricsCardHeaderProps {
  title: string;
  children?: React.ReactNode;
  link?: string;
  linkText?: string;
}

export const MetricsCardHeader: React.FC<MetricsCardHeaderProps> = ({ title, children, link, linkText }) => {
  return (
    <div className={styles.tileHeader}>
      <div className={styles.headerLabelContainer}>
        <label className={styles.headerLabel}>{title}</label>
        {children}
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
  label: string;
  /** If the value is null, the item will not be rendered. */
  value: number | string | null;
  small?: boolean;
  color?: 'default' | 'red';
}

export const MetricsCardItem: React.FC<MetricsCardItemProps> = ({ label, value, small, color }) => {
  if (value === null) {
    return null;
  }

  return (
    <div
      className={classNames(styles.metricItem, {
        [styles.smallItem]: small,
        [styles.mainItem]: !small,
      })}>
      <span className={styles.metricLabel}>{label}</span>
      <p
        className={classNames(styles.metricValue, {
          [styles.red]: color === 'red',
          [styles.smallValue]: small,
        })}>
        {value}
      </p>
    </div>
  );
};
