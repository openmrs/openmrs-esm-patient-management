import React from 'react';
import { Hourglass } from '@carbon/react/icons';
import type { WardPatientCardElement } from '../../types';
import styles from './row-elements.scss';

const WardHourGlass: WardPatientCardElement = () => {
  return (
    <div className={styles.waitingForItemContainer}>
      <Hourglass className={styles.hourGlassIcon} size="24" />:
    </div>
  );
};

export default WardHourGlass;
