import { InlineNotification } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardConfigObject } from '../config-schema';
import { type WardPatient } from '../types';
import WardPatientAge from './row-elements/ward-patient-age';
import WardPatientAddress from './row-elements/ward-patient-header-address';
import WardPatientIdentifier from './row-elements/ward-patient-identifier';
import WardPatientObs from './row-elements/ward-patient-obs';
import WardPatientTimeOnWard from './row-elements/ward-patient-time-on-ward';
import WardPatientTimeSinceAdmission from './row-elements/ward-patient-time-since-admission';

export interface WardPatientCardElementProps extends WardPatient {
  elementId: string;
}

export const WardPatientCardElement: React.FC<WardPatientCardElementProps> = ({
  elementId,
  patient,
  visit,
  inpatientAdmission,
}) => {
  const { obsElementDefinitions, identifierElementDefinitions, addressElementDefinitions } =
    useConfig<WardConfigObject>().wardPatientCards;
  const { t } = useTranslation();
  const { encounterAssigningToCurrentInpatientLocation, firstAdmissionOrTransferEncounter } = inpatientAdmission ?? {};

  switch (elementId) {
    case 'patient-age':
      return <WardPatientAge patient={patient} />;
    case 'time-on-ward': {
      return (
        <WardPatientTimeOnWard
          encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
        />
      );
    }
    case 'time-since-admission': {
      return <WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={firstAdmissionOrTransferEncounter} />;
    }
    default: {
      const obsConfig = obsElementDefinitions.find((elementDef) => elementDef.id === elementId);
      const idConfig = identifierElementDefinitions.find((elementDef) => elementDef.id === elementId);
      const addressConfig = addressElementDefinitions.find((elementDef) => elementDef.id === elementId);
      if (obsConfig) {
        return <WardPatientObs patient={patient} visit={visit} config={obsConfig} />;
      } else if (idConfig) {
        return <WardPatientIdentifier patient={patient} config={idConfig} />;
      } else if (addressConfig) {
        return <WardPatientAddress patient={patient} config={addressConfig} />;
      } else {
        return (
          <InlineNotification kind="error">
            {t(
              'invalidElementIdCopy',
              'The configuration provided is invalid. It contains the following unknown element ID:',
            )}{' '}
            {elementId}
          </InlineNotification>
        );
      }
    }
  }
};
