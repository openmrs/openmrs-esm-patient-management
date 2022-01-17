import React, { ReactNode } from 'react';
import { Tile, Button } from 'carbon-components-react';
import styles from './metrics-card.scss';
import { useTranslation } from 'react-i18next';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';

interface MetricsTilesProps {
  totalsLabel: string;
  totalsValue: number;
  headerLabel: string;
  childComponent?: React.ReactNode;
}

const MetricsTile: React.FC<MetricsTilesProps> = ({ totalsLabel, totalsValue, headerLabel, childComponent }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer} light={true}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {childComponent}
        </div>

        <Button kind="ghost" renderIcon={ArrowRight16} iconDescription={t('patientList', 'Patient list')}>
          {t('patientList', 'Patient list')}
        </Button>
      </div>
      <div>
        <label className={styles.totalsLabel}>{totalsLabel}</label>
        <p className={styles.totalsValue}>{totalsValue}</p>
      </div>
    </Tile>
  );
};

export default MetricsTile;
