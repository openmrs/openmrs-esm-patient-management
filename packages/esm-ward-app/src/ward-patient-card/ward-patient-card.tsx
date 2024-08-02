import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatient } from '../types';
import { type WardPatientWorkspaceProps } from '../ward-patient-workspace/types';
import { usePatientCardRows } from './ward-patient-card-row.resources';
import styles from './ward-patient-card.scss';

const WardPatientCard: React.FC<WardPatient> = (props) => {
  const patientCardRows = usePatientCardRows();

  return (
    <div className={styles.wardPatientCard}>
      {patientCardRows.map((WardPatientCardRow, i) => (
        <WardPatientCardRow key={i} {...props} />
      ))}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
            patientUuid: props.patient.uuid,
            ...props,
          });
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(props.patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
