import React from 'react';
import { type ObsElementConfig } from '../../config-schema';
import { type WardPatient } from '../../types';
import { useElementConfig } from '../../ward-view/ward-view.resource';
import WardPatientObs from '../row-elements/ward-patient-obs';
import styles from '../ward-patient-card.scss';

interface AdmissionRequestNoteRowProps {
  wardPatient: WardPatient;
  id: string;
}

const AdmissionRequestNoteRow: React.FC<AdmissionRequestNoteRowProps> = ({ id, wardPatient }) => {
  const { patient, visit, inpatientAdmission } = wardPatient;
  const { conceptUuid } = useElementConfig('admissionRequestNote', id) ?? {};
  const config: ObsElementConfig = {
    conceptUuid,
    limit: 0,
    id: 'admission-note',
    onlyWithinCurrentVisit: true,
    orderBy: 'ascending',
    label: 'Admission Note',
  };

  // only show if the patient has not been admitted yet
  const admitted = inpatientAdmission != null;
  if (admitted) {
    return null;
  } else {
    return (
      <div className={styles.wardPatientCardRow}>
        <WardPatientObs id={id} configOverride={config} patient={patient} visit={visit} />
      </div>
    );
  }
};

export default AdmissionRequestNoteRow;
