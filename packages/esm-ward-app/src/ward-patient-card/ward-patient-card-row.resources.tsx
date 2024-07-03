import { useConfig } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
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
import styles from './ward-patient-card.scss';
import wardPatientObs from './row-elements/ward-patient-obs';
import wardPatientCodedObsTags from './row-elements/ward-patient-coded-obs-tags';
import WardHourGlass from './row-elements/ward-hour-glass';
import WardPatientTransfer from './row-elements/ward-patient-transfer';
import WardPatientPendingOrders from './row-elements/ward-patient-pending-orders';
import classNames from 'classnames';

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

      const WardPatientCardRow: React.FC<WardPatientCardProps> = (props) => {
        return (
          <div
            className={classNames(styles.wardPatientCardRow, {
              [styles.wardPatientCardHeader]: rowType === 'header',
              [styles.wardPatientCardWaitingFor]: rowType === 'waitingFor',
            })}>
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

function getPatientCardElementFromDefinition(
  patientCardElementDef: PatientCardElementDefinition,
): WardPatientCardElement {
  const { elementType, config } = patientCardElementDef;
  switch (elementType) {
    case 'hour-glass':
      return WardHourGlass;
    case 'patient-transfer':
      return WardPatientTransfer;
    case 'bed-number':
      return WardPatientBedNumber;
    case 'patient-name':
      return WardPatientName;
    case 'patient-age':
      return WardPatientAge;
    case 'patient-pending-orders': {
      return (props: WardPatientCardProps) => <WardPatientPendingOrders {...props} {...config.orders} />;
    }
    case 'patient-address': {
      return wardPatientAddress(config.address);
    }
    case 'patient-obs': {
      return wardPatientObs(config.obs);
    }
    case 'patient-coded-obs-tags': {
      return wardPatientCodedObsTags(config.codedObsTags);
    }
  }
}
