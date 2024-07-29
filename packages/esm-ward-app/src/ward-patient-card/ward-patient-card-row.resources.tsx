import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { type Patient, useConfig, type Visit } from '@openmrs/esm-framework';
import { defaultWardPatientCard, type WardConfigObject } from '../config-schema';
import useWardLocation from '../hooks/useWardLocation';
import WardPatientAge from './row-elements/ward-patient-age';
import WardPatientTimeOnWard from './row-elements/ward-patient-time-on-ward';
import WardPatientTimeSinceAdmission from './row-elements/ward-patient-time-since-admission';
import WardPatientObs from './row-elements/ward-patient-obs';
import WardPatientIdentifier from './row-elements/ward-patient-identifier';
import WardPatientAddress from './row-elements/ward-patient-header-address';
import type { WardPatientCardProps } from './ward-patient-card';
import { type Encounter } from '../types';

export function useCurrentWardCardConfig() {
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const {
    location: { uuid: locationUuid },
  } = useWardLocation();

  const currentWardCardConfig = useMemo(() => {
    const cardDefinition = wardPatientCards.cardDefinitions.find((cardDef) => {
      return (
        cardDef.appliedTo == null ||
        cardDef.appliedTo?.length == 0 ||
        cardDef.appliedTo.some((criteria) => criteria.location == locationUuid)
      );
    });

    return cardDefinition;
  }, [wardPatientCards, locationUuid]);

  if (!currentWardCardConfig) {
    console.warn(
      'No ward card configuration has `appliedTo` criteria that matches the current location. Using the default configuration.',
    );
    return defaultWardPatientCard;
  }

  return currentWardCardConfig;
}

export interface WardPatientCardElementProps {
  elementId: string;
  patient: Patient;
  visit: Visit;
  encounterAssigningToCurrentInpatientLocation: Encounter;
  firstAdmissionOrTransferEncounter: Encounter;
}

export const WardPatientCardElement: React.FC<WardPatientCardElementProps> = ({
  elementId,
  patient,
  visit,
  encounterAssigningToCurrentInpatientLocation,
  firstAdmissionOrTransferEncounter,
}) => {
  const { obsElementDefinitions, identifierElementDefinitions, addressElementDefinitions } =
    useConfig<WardConfigObject>().wardPatientCards;
  const { t } = useTranslation();

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
