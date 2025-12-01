import React from 'react';
import styles from '../prescription-template.scss';

export const Signature: React.FC = () => {
  return (
    <div className={styles.signatureArea}>
      <div className={styles.signatureLine}></div>
      <p className={styles.signatureText}>SIGNATURE</p>
    </div>
  );
};
