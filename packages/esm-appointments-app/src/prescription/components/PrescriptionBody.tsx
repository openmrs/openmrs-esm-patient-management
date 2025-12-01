import React from 'react';
import { Watermark } from './Watermark';
import { Signature } from './Signature';
import styles from '../prescription-template.scss';

interface PrescriptionBodyProps {
  showDiagnosis?: boolean;
  watermarkLogoUrl?: string;
  watermarkAlignment?: 'left' | 'center' | 'right';
  watermarkOpacity?: number;
}

export const PrescriptionBody: React.FC<PrescriptionBodyProps> = ({
  showDiagnosis = true,
  watermarkLogoUrl,
  watermarkAlignment = 'center',
  watermarkOpacity = 0.04,
}) => {
  return (
    <div className={styles.prescriptionBody}>
      <Watermark logoUrl={watermarkLogoUrl} alignment={watermarkAlignment} opacity={watermarkOpacity} />

      <div className={`${styles.prescriptionColumns} ${!showDiagnosis ? styles.noDiagnosis : ''}`}>
        {/* Rx Section */}
        <div className={styles.rxColumn}>
          <div className={styles.rxSection}>
            <span className={styles.rxSymbol}>
              R<sub>x</sub>
            </span>
          </div>
        </div>

        {showDiagnosis && (
          <>
            <div className={styles.columnDivider}></div>
            <div className={styles.diagnosisColumn}>
              <div className={styles.diagnosisSection}>
                <h3 className={styles.diagnosisTitle}>Diagnosis</h3>
                <div className={styles.diagnosisContent}></div>
              </div>
            </div>
          </>
        )}
      </div>

      <Signature />
    </div>
  );
};
