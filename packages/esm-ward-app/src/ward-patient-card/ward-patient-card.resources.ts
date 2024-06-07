import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardConfigObject } from '../config-schema';
import type { WardPatientCardBentoElement } from '../types';
import admittedPatientAddress from './bento-elements/ward-patient-header-address';
import AdmittedPatientHeaderAge from './bento-elements/ward-patient-age';
import AdmittedPatientHeaderBedNumber from './bento-elements/ward-patient-bed-number';
import WardPatientSlotElementName from './bento-elements/ward-patient-name';
import AdmittedPatientHeaderTime from './bento-elements/ward-patient-admission-time';

export function useCardSlots(location: string) {
  const { t } = useTranslation();
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const { cardDefinitions } = wardPatientCards;

  const bentoElementsMap = useMemo(() => {
    const map = new Map<string, WardPatientCardBentoElement>();
    for (const slotElementDef of bentoElementDefinitions) {
      map.set(slotElementDef.id, getBentoElementFromDefinition(slotElementDef));
    }
    return map;
  }, []);

  const cardDefinition = useMemo(
    () =>
      cardDefinitions.find((cardDef) => {
        const appliedTo = cardDef.appliedTo;

        return (
          appliedTo == null ||
          appliedTo.some(criteria => criteria.location == location)
        );
      }),
    [wardPatientCards, location],
  );

  const bentoElements = cardDefinition.card.header.map((bentoElementId) => {
    const slot = bentoElementsMap.get(bentoElementId);
    return slot;
  });

  return bentoElements;
}

function getBentoElementFromDefinition(bentoELementId: string): WardPatientCardBentoElement {
  switch (bentoELementId) {
    case 'bed-number':
      return AdmittedPatientHeaderBedNumber;
    case 'patient-name':
      return WardPatientSlotElementName;
    case 'patient-age':
      return AdmittedPatientHeaderAge;
    case 'patient-address': {
      // TODO: configure address fields to pass in
      return admittedPatientAddress({});
    }
    case 'admission-time':
      return AdmittedPatientHeaderTime;
  }
}