import { BabyIcon, MotherIcon, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type MotherChildRowExtensionDefinition } from '../../config-schema';
import { type MothersAndChildrenSearchCriteria, useMotherAndChildren } from '../../hooks/useMotherAndChildren';
import useWardLocation from '../../hooks/useWardLocation';
import { type WardPatientCard } from '../../types';
import WardPatientAge from '../row-elements/ward-patient-age';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier';
import WardPatientLocation from '../row-elements/ward-patient-location';
import WardPatientName from '../row-elements/ward-patient-name';
import wardPatientCardStyles from '../ward-patient-card.scss';
import styles from './mother-child-row.scss';
import classNames from 'classnames';

const motherAndChildrenRep =
  'custom:(childAdmission,mother:(person,identifiers:full,uuid),child:(person,identifiers:full,uuid),motherAdmission)';

/**
 * This extension displays the mother or children of the patient in the patient card.
 *
 * @param param0
 * @returns
 */
const MotherChildRowExtension: WardPatientCard = ({ patient }) => {
  const { maternalWardLocations: maternalLocations, childrenWardLocations: childLocations } =
    useConfig<MotherChildRowExtensionDefinition>();
  const { location } = useWardLocation();

  const params: MothersAndChildrenSearchCriteria = {
    // mothers: [patient.uuid],
    // children: [patient.uuid],
    requireMotherHasActiveVisit: true,
    requireChildHasActiveVisit: true,
    requireChildBornDuringMothersActiveVisit: true,
  };

  const { data } = useMotherAndChildren(params, true, motherAndChildrenRep);

  return (
    <>
      {data?.map(({ mother, motherAdmission, child, childAdmission }) => {
        // patient A is the patient card's patient
        const patientA = patient;
        // patient B is either the mother or the child of patient A
        const isPatientBTheMother = mother.uuid != patientA.uuid;
        const patientB = isPatientBTheMother ? mother : child;

        // we display patient B here
        const Icon = isPatientBTheMother ? MotherIcon : BabyIcon;
        const patientBAdmission = isPatientBTheMother ? motherAdmission : childAdmission;

        return (
          <div
            key={patientB.uuid}
            className={classNames(styles.motherOrBabyRow, wardPatientCardStyles.wardPatientCardRow)}>
            <div className={styles.motherOrBabyIconDiv}>
              <Icon className={styles.motherOrBabyIcon} size={24} />
            </div>
            <div className={wardPatientCardStyles.dotSeparatedChildren}>
              <WardPatientName patient={patientB} />
              <WardPatientIdentifier patient={patientB} />
              <WardPatientAge patient={patientB} />
              <WardPatientLocation inpatientAdmission={patientBAdmission} />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MotherChildRowExtension;
