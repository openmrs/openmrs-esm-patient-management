import React from 'react';
import styles from '../prescription-template.scss';

interface PrescriptionHeaderProps {
  doctorName: string;
  qualification?: string;
  logoUrl?: string;
}

export const PrescriptionHeader: React.FC<PrescriptionHeaderProps> = ({ doctorName, qualification, logoUrl }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.doctorSection}>
          <h1 className={styles.doctorName}>{doctorName}</h1>
          {qualification && <p className={styles.qualification}>{qualification}</p>}
        </div>
        {logoUrl && (
          <div className={styles.logoSection}>
            <div className={styles.headerLogo}>
              <img src={logoUrl} alt="Hospital Logo" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
