import { useVisit } from '@openmrs/esm-framework';
import React from 'react';
import { type PatientObsElementConfig } from '../../config-schema';
import { type Encounter, type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';
import { SkeletonText } from '@carbon/react';

// prettier-ignore
export const visitCustomRepresentation =
  'custom:(uuid,display,voided,indication,startDatetime,stopDatetime,' +
  'encounters:(uuid,display,encounterDatetime,' +
    'form:(uuid,name),location:ref,' +
    'obs:(uuid,display,concept:(uuid,display)),' + 
    'encounterType:ref,' +
    'encounterProviders:(uuid,display,' +
      'provider:(uuid,display))),' +
  'patient:(uuid,display),' +
  'visitType:(uuid,name,display),' +
  'attributes:(uuid,display,attributeType:(name,datatypeClassname,uuid),value),' +
  'location:(uuid,name,display))';

const wardPatientObs = (config: PatientObsElementConfig) => {
  const WardPatientObs: WardPatientCardElement = ({ patient }) => {
    const { obsConceptUuid } = config;
    const { activeVisit } = useVisit(patient.uuid, visitCustomRepresentation);
    if (activeVisit) {
      const encounters = activeVisit.encounters as Encounter[];
      const obs = encounters.flatMap((e) => e?.obs).find((obs) => obs?.concept?.uuid == obsConceptUuid);
      return <div className={styles.wardPatientAddress}>{obs.display}</div>;
    } else {
      return <SkeletonText />;
    }
  };

  return WardPatientObs;
};

export default wardPatientObs;
