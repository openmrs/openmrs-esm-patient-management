import React from 'react';
import { Stethoscope } from '@carbon/react/icons';
import styles from './header.scss';

const Illustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <Stethoscope className={styles.iconOverrides} />
    </div>
  );
};

export default Illustration;
