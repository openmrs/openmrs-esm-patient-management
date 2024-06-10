import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import {
  builtInBentoElements,
  defaultBentoElementConfig,
  type BentoElementDefinition,
  type WardConfigObject,
} from '../config-schema';
import type { WardPatientCardBentoElement } from '../types';
import WardPatientAge from './bento-elements/ward-patient-age';
import WardPatientBedNumber from './bento-elements/ward-patient-bed-number';
import wardPatientAddress from './bento-elements/ward-patient-header-address';
import WardPatientName from './bento-elements/ward-patient-name';

export function useBentoElements(location: string) {
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

  const bentoElements = cardDefinition.card.header.map((bentoElementId) => {
    const slot = bentoElementsMap.get(bentoElementId);
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
  }
}
