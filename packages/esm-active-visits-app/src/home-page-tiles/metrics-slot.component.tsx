import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';
import styles from './metrics-slot.scss';

const MetricsSlot = () => {
  return <ExtensionSlot name="metrics-extension-slot" className={styles.extensionSlot} />;
};

export default MetricsSlot;
