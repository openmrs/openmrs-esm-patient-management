import React from 'react';
import { type IdentifierElementConfig } from '../../config-schema';
import { Tag } from '@carbon/react';
import { type Patient, translateFrom, type PatientIdentifier } from '@openmrs/esm-framework';
import { moduleName } from '../../constant';
import { useTranslation } from 'react-i18next';
import { useElementConfig } from '../../ward-view/ward-view.resource';

/** Sort the identifiers by preferred first. The identifier with value of true
 * takes precedence over false. If both identifiers have same preferred value,
 * sort them by most recently created or changed. */
const identifierCompareFunction = (pi1: PatientIdentifier, pi2: PatientIdentifier) => {
  let comp = (pi2.preferred ? 1 : 0) - (pi1.preferred ? 1 : 0);

  if (comp == 0) {
    const date1 = pi1.auditInfo.dateChanged ?? pi1.auditInfo.dateCreated;
    const date2 = pi2.auditInfo.dateChanged ?? pi2.auditInfo.dateCreated;
    comp = date2.localeCompare(date1);
  }
  return comp;
};

export interface WardPatientIdentifierProps {
  patient: Patient;
  id?: string;
}

const defaultConfig: IdentifierElementConfig = {
  id: 'patient-identifier',
  identifierTypeUuid: null,
};

const WardPatientIdentifier: React.FC<WardPatientIdentifierProps> = ({ id, patient }) => {
  const { t } = useTranslation();
  const config = useElementConfig('patientIdentifier', id) ?? defaultConfig;

  const { identifierTypeUuid, label } = config;
  const patientIdentifiers = patient.identifiers.filter(
    (patientIdentifier: PatientIdentifier) =>
      identifierTypeUuid == null || patientIdentifier.identifierType?.uuid === identifierTypeUuid,
  );
  patientIdentifiers.sort(identifierCompareFunction);
  const patientIdentifier = patientIdentifiers[0];
  const labelToDisplay = label != null ? t(label) : patientIdentifier?.identifierType?.name;
  return (
    <div>
      {labelToDisplay ? <Tag>{t('identifierTypelabel', '{{label}}:', { label: labelToDisplay })}</Tag> : <></>}
      <span>{patientIdentifier?.identifier}</span>
    </div>
  );
};

export default WardPatientIdentifier;
