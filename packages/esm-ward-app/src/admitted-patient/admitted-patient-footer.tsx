import React from 'react';
import styles from './admitted-patient-footer.scss';
import { Tag } from '@carbon/react';

const AdmittedPatientFooter = () => {
  return (
    <>
      <div className={styles.divider}></div>
      <div>
        <Tag className="some-class" type="gray">
          {'Pre-eclampsia'}
        </Tag>
        <Tag className="some-class" type="red">
          {'Fainted Overnight'}
        </Tag>
        <Tag className="some-class" type="red">
          {'Vomitting'}
        </Tag>
        <div className={styles.admittedPatientDescription}>
          <div className={styles.admittedPatientTimeSpent}>
            Time on this ward: <span>4 hours</span>
          </div>
          <div className={styles.admittedPatientGravity}>
            Gravity: <span>2</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdmittedPatientFooter;
