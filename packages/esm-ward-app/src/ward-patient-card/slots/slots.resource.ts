import { showToast, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardConfigObject, SlotDefinition, SlotElementDefinition } from '../../config-schema';
import type { WardPatientCardSlot, WardPatientCardSlotElement } from '../../types';
import admittedPatientAddress from '../slot-elements/admitted-patient-header-address';
import AdmittedPatientHeaderAge from '../slot-elements/admitted-patient-header-age';
import AdmittedPatientHeaderBedNumber from '../slot-elements/admitted-patient-header-bed-number';
import WardPatientSlotElementName from '../slot-elements/admitted-patient-header-name';
import AdmittedPatientHeaderTime from '../slot-elements/admitted-patient-header-time';
import wardPatientCardBentoSlot from './ward-patient-card-bento-slot.component';

export function useCardSlots(location: string, status: string) {
  const { t } = useTranslation();
  const { wardPatientCardConfig } = useConfig<WardConfigObject>();
  const { cardDefinitions, slotDefinitions, slotElementDefinitions } = wardPatientCardConfig;

  const slotElementsMap = useMemo(() => {
    const map = new Map<string, WardPatientCardSlotElement>();
    for (const slotElementDef of slotElementDefinitions) {
      map.set(slotElementDef.id, getSlotElementFromDefinition(slotElementDef));
    }
    return map;
  }, []);
  const slotsMap = useMemo(() => {
    const map = new Map<string, WardPatientCardSlot>();
    for (const slotDef of slotDefinitions) {
      map.set(slotDef.id, getSlotFromDefinition(slotDef, slotElementsMap));
    }
    return map;
  }, []);

  const slotsDefinition = useMemo(
    () =>
      cardDefinitions.find((cardDef) => {
        const appliedTo = cardDef.appliedTo;

        return (
          appliedTo == null ||
          appliedTo.some(
            (criteria) =>
              (criteria.location == null || criteria.location == location) &&
              (criteria.status == null || criteria.status == status),
          )
        );
      }),
    [wardPatientCardConfig, location, status],
  );

  const slots = slotsDefinition.slots.map((slotId) => {
    const slot = slotsMap.get(slotId);
    if (!slot) {
      showToast({
        title: t('invalidSlotConfig', 'Invalid slot config'),
        kind: 'warning',
        description: 'Unknown slot id: ' + slotId,
      });
    }
    return slot;
  });

  return slots;
}

function getSlotElementFromDefinition(slotElementDef: SlotElementDefinition): WardPatientCardSlotElement {
  switch (slotElementDef.slotElementType) {
    case 'bed-number-slot-element':
      return AdmittedPatientHeaderBedNumber;
    case 'patient-name-slot-element':
      return WardPatientSlotElementName;
    case 'patient-age-slot-element':
      return AdmittedPatientHeaderAge;
    case 'patient-address-slot-element': {
      const { config } = slotElementDef;
      return admittedPatientAddress(config);
    }
    case 'admission-time-slot-element':
      return AdmittedPatientHeaderTime;
  }
}

function getSlotFromDefinition(
  slotDef: SlotDefinition,
  slotElementsMap: Map<string, WardPatientCardSlotElement>,
): WardPatientCardSlot {
  const { slotType } = slotDef;
  switch (slotType) {
    case 'bento-slot': {
      const { elements } = slotDef;
      const slotElements = elements.map((element) => slotElementsMap.get(element));
      return wardPatientCardBentoSlot(slotElements);
    }
    default: {
      throw new Error('Unknown slot type from configuration' + slotType);
    }
  }
}
