import React from 'react';
import { type WardPatientCardProps } from '../types';
import { usePatientCardRows } from './ward-patient-card-row.resources';
import styles from './ward-patient-card.scss';
import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import { type WardPatientWorkspaceProps } from '../ward-patient-workspace/types';

const WardPatientCard: React.FC<WardPatientCardProps> = (props) => {
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
