import React from 'react';
import { useParams } from 'react-router-dom';
import { type WardPatientCardProps } from '../types';
import { usePatientCardRows } from './ward-patient-card-row.resources';
import styles from './ward-patient-card.scss';
import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import { getWardStore } from '../store';
import classNames from 'classnames';

const spaRoot = window['getOpenmrsSpaBase'];

const WardPatientCard: React.FC<WardPatientCardProps> = (props) => {
  const wardStore = getWardStore();
  const activeBedSelection = wardStore.getState().activeBedSelection;
  const { locationUuid } = useParams();
  const patientCardRows = usePatientCardRows(locationUuid);

  return (
    <div className={styles.wardPatientCard}>
      {patientCardRows.map((WardPatientCardRow, i) => (
        <WardPatientCardRow key={i} {...props} />
      ))}
      <button
        className={classNames(styles.wardPatientCardButton, {
          // []: activeBedSelection?.bed.uuid !== props.bed.uuid,
          [styles.activeWardPatientCard]: activeBedSelection?.bed.uuid === props.bed.uuid,
        })}
        onClick={() => {
          wardStore.setState({ activeBedSelection: { ...props } });
          launchWorkspace('ward-patient-workspace');
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(props.patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
