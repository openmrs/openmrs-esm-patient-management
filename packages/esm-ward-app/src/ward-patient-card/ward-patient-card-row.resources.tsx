import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import {
  builtInPatientCardElements,
  defaultPatientCardElementConfig,
  type PatientCardElementDefinition,
  type WardConfigObject,
} from '../config-schema';
import type { WardPatientCardElement, WardPatientCardProps } from '../types';
import WardPatientAge from './row-elements/ward-patient-age';
import WardPatientBedNumber from './row-elements/ward-patient-bed-number';
import wardPatientAddress from './row-elements/ward-patient-header-address';
import WardPatientName from './row-elements/ward-patient-name';
import React from 'react';
import styles from './ward-patient-card.scss';
import wardPatientObs from './row-elements/ward-patient-obs';

export function usePatientCardRows(location: string) {
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const patientCardRows = useMemo(() => {
    const { cardDefinitions, patientCardElementDefinitions } = wardPatientCards;

    // map of patientCardElementId to its corresponding React component
    const patientCardElementsMap = new Map<string, WardPatientCardElement>();
    for (const elementType of builtInPatientCardElements) {
      patientCardElementsMap.set(
        elementType,
        getPatientCardElementFromDefinition({
          id: elementType,
          elementType,
          config: defaultPatientCardElementConfig,
        }),
      );
    }
    for (const patientCardElementDef of patientCardElementDefinitions) {
      patientCardElementsMap.set(patientCardElementDef.id, getPatientCardElementFromDefinition(patientCardElementDef));
    }

    const cardDefinition = cardDefinitions.find((cardDef) => {
      const appliedTo = cardDef.appliedTo;

      return appliedTo == null || appliedTo.some((criteria) => criteria.location == location);
    });

    const ret = cardDefinition.rows.map((row) => {
      const { rowType, elements } = row;
      const patientCardElements = elements.map((patientCardElementId) => {
        const slot = patientCardElementsMap.get(patientCardElementId);
        return slot;
      });

      const WardPatientCardRow: React.FC<WardPatientCardProps> = ({ patient, bed }) => {
        return (
          <div className={styles.wardPatientCardRow + ' ' + (rowType == 'header' ? styles.wardPatientCardHeader : '')}>
            {patientCardElements.map((PatientCardElement, i) => (
              <PatientCardElement patient={patient} bed={bed} key={i} />
            ))}
          </div>
        );
      };

      return WardPatientCardRow;
    });
    return ret;
  }, [location, wardPatientCards]);

  return patientCardRows;
}

function getPatientCardElementFromDefinition(
  patientCardElementDef: PatientCardElementDefinition,
): WardPatientCardElement {
  const { elementType, config } = patientCardElementDef;
  switch (elementType) {
    case 'bed-number':
      return WardPatientBedNumber;
    case 'patient-name':
      return WardPatientName;
    case 'patient-age':
      return WardPatientAge;
    case 'patient-address': {
      return wardPatientAddress(config);
    }
    case 'patient-obs': {
      return wardPatientObs(config);
    }
  }
}
