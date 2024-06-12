import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type BentoElementDefinition,
  builtInBentoElements,
  defaultBentoElementConfig,
  type WardConfigObject,
} from '../config-schema';
import type { WardPatientCardBentoElement } from '../types';
import wardPatientAddress from './bento-elements/ward-patient-header-address';
import WardPatientAge from './bento-elements/ward-patient-age';
import WardPatientBedNumber from './bento-elements/ward-patient-bed-number';
import WardPatientName from './bento-elements/ward-patient-name';
import WardPatientAdmissionTime from './bento-elements/ward-patient-admission-time';
import React from 'react';

export function useCardSlots(location: string, cardType: string) {
  const { t } = useTranslation();
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const { cardDefinitions, bentoElementDefinitions } = wardPatientCards;

  // map of bentoElementId to its corresponding React component
  const bentoElementsMap = useMemo(() => {
    const map = new Map<string, WardPatientCardBentoElement>();

    for (const elementType of builtInBentoElements) {
      map.set(
        elementType,
        getBentoElementFromDefinition({
          id: elementType,
          elementType,
          config: defaultBentoElementConfig,
        }),
      );
    }
    for (const bentoElementDef of bentoElementDefinitions) {
      map.set(bentoElementDef.id, getBentoElementFromDefinition(bentoElementDef));
    }
    return map;
  }, []);

  const cardDefinition = useMemo(
    () =>
      cardDefinitions.find((cardDef) => {
        const appliedTo = cardDef.appliedTo;

        return appliedTo == null || appliedTo.some((criteria) => criteria.location == location);
      }),
    [wardPatientCards, location],
  );

  const bentoElements = cardDefinition.card.header.map((bentoElement) => {
    if (!bentoElement.appliesTo.includes(cardType)) {
      return React.Fragment;
    }
    const slot = bentoElementsMap.get(bentoElement.id);
    return slot;
  });

  return bentoElements;
}

function getBentoElementFromDefinition(bentoElementDef: BentoElementDefinition): WardPatientCardBentoElement {
  const { elementType, config } = bentoElementDef;
  switch (elementType) {
    case 'bed-number':
      return WardPatientBedNumber;
    case 'patient-name':
      return WardPatientName;
    case 'patient-age':
      return WardPatientAge;
    case 'patient-address': {
      // TODO: configure address fields to pass in
      return wardPatientAddress(config);
    }
    case 'admission-time':
      return WardPatientAdmissionTime;
  }
}
