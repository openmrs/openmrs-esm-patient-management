import React from 'react';
import { type WardPatientCardElement } from '../../types';
import { type PatientCardElementConfig } from '../../config-schema';
import { Tag } from '@carbon/react';
import { translateFrom, type PatientIdentifier } from '@openmrs/esm-framework';
import { moduleName } from '../../constant';
import { useTranslation } from 'react-i18next';

const identifierCompareFunction = (pi1: PatientIdentifier, pi2: PatientIdentifier) => {
  //check if preferred is set to true in any of patient identifier, if preferred is true
  //only for pi2 return 1 so it comes at front,else if preferred
  //is true only for pi1 return -1 since its already in the front.
  let comp = (pi2.preferred ? 1 : 0) - (pi1.preferred ? 1 : 0);

  //if the value of preferred is same in both the patient identifiers,then sort it by most recent date
  //check for dateChanged value if present else use dateCreated value
  if (comp == 0) {
    const date1 = pi1.auditInfo.dateChanged ?? pi1.auditInfo.dateCreated;
    const date2 = pi2.auditInfo.dateChanged ?? pi2.auditInfo.dateCreated;
    comp = date2.localeCompare(date1);
  }
  return comp;
};

const wardPatientIdentifier = (config: PatientCardElementConfig) => {
  const WardPatientIdentifier: WardPatientCardElement = ({ patient }) => {
    const { t } = useTranslation();
    const { identifierTypeUuid, labelI18nModule: labelModule, label } = config;
    const patientIdentifiers = patient.identifiers.filter(
      (patientIdentifier: PatientIdentifier) =>
        identifierTypeUuid == null || patientIdentifier.identifierType?.uuid === identifierTypeUuid,
    );
    patientIdentifiers.sort(identifierCompareFunction);
    const patientIdentifier = patientIdentifiers[0];
    const labelToDisplay =
      label != null ? translateFrom(labelModule ?? moduleName, label) : patientIdentifier?.identifierType.name;
    return (
      <div>
        {labelToDisplay ? <Tag>{t('identifierTypelabel', '{{label}}:', { label: labelToDisplay })}</Tag> : <></>}
        <span>{patientIdentifier?.identifier}</span>
      </div>
    );
  };
  return WardPatientIdentifier;
};

export default wardPatientIdentifier;
