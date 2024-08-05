import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  builtInPatientCardElements,
  defaultPatientCardElementConfig,
  type PatientCardElementDefinition,
  type WardConfigObject,
} from '../config-schema';
import useWardLocation from '../hooks/useWardLocation';
import type { WardPatient, WardPatientCardElement } from '../types';
import WardPatientAge from './row-elements/ward-patient-age';
import WardPatientBedNumber from './row-elements/ward-patient-bed-number';
import wardPatientCodedObsTags from './row-elements/ward-patient-coded-obs-tags';
import WardPatientGender from './row-elements/ward-patient-gender.component';
import wardPatientAddress from './row-elements/ward-patient-header-address';
import wardPatientIdentifier from './row-elements/ward-patient-identifier';
import WardPatientName from './row-elements/ward-patient-name';
import wardPatientObs from './row-elements/ward-patient-obs';
import WardPatientTimeOnWard from './row-elements/ward-patient-time-on-ward';
import WardPatientTimeSinceAdmission from './row-elements/ward-patient-time-since-admission';
import styles from './ward-patient-card.scss';

export function usePatientCardRows() {
  const {
    location: { uuid: locationUuid },
  } = useWardLocation();
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const { t } = useTranslation();
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
      const element = getPatientCardElementFromDefinition(patientCardElementDef);
      if (element == null) {
        showSnackbar({
          title: t('configError', 'Configuration Error'),
          kind: 'error',
          subtitle: t(
            'unknownElementType2',
            "Unknown element type '{{elementType}}', check the ward app configurations",
            { elementType: patientCardElementDef.elementType },
          ),
        });
      } else {
        patientCardElementsMap.set(patientCardElementDef.id, element);
      }
    }

    const cardDefinition = cardDefinitions.find((cardDef) => {
      const appliedTo = cardDef.appliedTo;

      return appliedTo == null || appliedTo.some((criteria) => criteria.location == locationUuid);
    });

    const ret = cardDefinition.rows.map((row) => {
      const { rowType, elements } = row;
      const patientCardElements = elements.map((patientCardElementId) => {
        const slot = patientCardElementsMap.get(patientCardElementId);
        return slot;
      });

      const WardPatientCardRow: React.FC<WardPatient> = (props) => {
        return (
          <div className={styles.wardPatientCardRow + ' ' + (rowType == 'header' ? styles.wardPatientCardHeader : '')}>
            {patientCardElements.map((PatientCardElement, i) => (
              <PatientCardElement {...props} key={i} />
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

export function getPatientCardElementFromDefinition(
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
      return wardPatientAddress(config.address);
    }
    case 'patient-gender': {
      return WardPatientGender;
    }
    case 'patient-obs': {
      return wardPatientObs(config.obs);
    }
    case 'patient-identifier':
      return wardPatientIdentifier(config);
    case 'patient-coded-obs-tags': {
      return wardPatientCodedObsTags(config.codedObsTags);
    }
    case 'time-on-ward': {
      return WardPatientTimeOnWard;
    }
    case 'time-since-admission': {
      return WardPatientTimeSinceAdmission;
    }
    default: {
      throw new Error('Unknown element type: ' + elementType);
    }
  }
}
