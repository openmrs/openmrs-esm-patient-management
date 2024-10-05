import React from 'react';
import { type ObsElementDefinition } from '../../config-schema';
import { type WardPatientCardType } from '../../types';
import WardPatientObs from '../row-elements/ward-patient-obs';
import { useConfig } from '@openmrs/esm-framework';
import styles from '../ward-patient-card.scss';

const AdmissionRequestNoteRowExtension: WardPatientCardType = ({ patient, visit, inpatientAdmission }) => {
  const { conceptUuid } = useConfig<ObsElementDefinition>();
  const config: ObsElementDefinition = {
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
        <WardPatientObs config={config} patient={patient} visit={visit} />
      </div>
    );
  }
};

export default AdmissionRequestNoteRowExtension;
