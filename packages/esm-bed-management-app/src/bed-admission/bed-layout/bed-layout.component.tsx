import React, { useRef } from 'react';
import classnames from 'classnames';
import styles from './bed-layout.scss';
import { type patientDetailsProps } from '../types';
import { type BedDetails } from '../../types';

interface BedProps {
  handleBedAssignment?: () => void;
  isBedSelected?: boolean;
  layOutStyles?: string;
  bedPillowStyles?: string;
  patientDetails?: patientDetailsProps;
  bedDetails?: BedDetails;
}

const BedLayout: React.FC<BedProps> = ({
  layOutStyles,
  bedPillowStyles,
  handleBedAssignment,
  isBedSelected,
  bedDetails,
  patientDetails,
}) => {
  const bedRef = useRef(null);

  return (
    <>
      <div
        ref={bedRef}
        role="button"
        tabIndex={0}
        onClick={() => handleBedAssignment()}
        className={classnames(styles.bedLayout, {
          [layOutStyles]: layOutStyles,
          [styles.bedLayoutSelected]:
            isBedSelected ||
            (bedDetails && bedDetails.patient && bedDetails.patient.uuid === patientDetails.patientUuid),
        })}>
        <div
          className={classnames(styles.bedPillow, {
            [bedPillowStyles]: bedPillowStyles,
          })}></div>
        <div style={{ display: 'grid' }}>
          <span className={styles.bedNumber}>{bedDetails && bedDetails.bedNumber}</span>
          <span className={styles.bedNumber}>
            {bedDetails && bedDetails.patient && bedDetails.patient.uuid === patientDetails.patientUuid
              ? bedDetails.patient.identifiers[0].identifier
              : ''}
          </span>
        </div>
      </div>
    </>
  );
};

export default BedLayout;
