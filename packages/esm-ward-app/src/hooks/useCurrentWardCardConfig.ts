import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { type WardConfigObject, defaultWardPatientCard } from '../config-schema';
import useWardLocation from './useWardLocation';

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
