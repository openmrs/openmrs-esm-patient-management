import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import {
  builtInPatientCardElements,
  defaultPatientCardElementConfig,
  type PatientCardElementDefinition,
  type WardConfigObject,
} from '../config-schema';
import type { WardPatientCardElement } from '../types';
import WardPatientAge from './row-elements/ward-patient-age';
import WardPatientBedNumber from './row-elements/ward-patient-bed-number';
import wardPatientAddress from './row-elements/ward-patient-header-address';
import WardPatientName from './row-elements/ward-patient-name';

export function usePatientCardElements(location: string) {
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const { cardDefinitions, patientCardElementDefinitions } = wardPatientCards;

  // map of patientCardElementId to its corresponding React component
  const patientCardElementsMap = useMemo(() => {
    const map = new Map<string, WardPatientCardElement>();
    for (const elementType of builtInPatientCardElements) {
      map.set(
        elementType,
        getPatientCardElementFromDefinition({
          id: elementType,
          elementType,
          config: defaultPatientCardElementConfig,
        }),
      );
    }
    for (const patientCardElementDef of patientCardElementDefinitions) {
      map.set(patientCardElementDef.id, getPatientCardElementFromDefinition(patientCardElementDef));
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

  const patientCardElements = cardDefinition.card.header.map((patientCardElementId) => {
    const slot = patientCardElementsMap.get(patientCardElementId);
    return slot;
  });

  return patientCardElements;
}

function getPatientCardElementFromDefinition(patientCardElementDef: PatientCardElementDefinition): WardPatientCardElement {
  const { elementType, config } = patientCardElementDef;
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
