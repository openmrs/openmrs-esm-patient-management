import { BabyIcon, MotherIcon, useAppContext } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { type MaternalWardViewContext, type WardPatientCardType } from '../../types';
import WardPatientAge from '../row-elements/ward-patient-age';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier';
import WardPatientLocation from '../row-elements/ward-patient-location';
import WardPatientName from '../row-elements/ward-patient-name';
import wardPatientCardStyles from '../ward-patient-card.scss';
import styles from './mother-child-row.scss';

/**
 * This extension displays the mother or children of the patient in the patient card.
 *
 * @param param0
 * @returns
 */
const MotherChildRowExtension: WardPatientCardType = ({ patient }) => {
  const { motherChildrenRelationshipsByPatient } =
    useAppContext<MaternalWardViewContext>('maternal-ward-view-context') ?? {};

  const motherChildRelationships = motherChildrenRelationshipsByPatient?.get(patient.uuid) ?? [];
  return (
    <>
      {motherChildRelationships.map(({ mother, motherAdmission, child, childAdmission }) => {
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
            <div className={classNames(styles.motherOrBabyRowElementsDiv, wardPatientCardStyles.dotSeparatedChildren)}>
              <WardPatientName patient={patientB} />
              <WardPatientIdentifier id="patient-identifier" patient={patientB} />
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
