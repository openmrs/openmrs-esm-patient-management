import { InlineNotification } from '@carbon/react';
import { BabyIcon, MotherIcon, useConfig } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type MothersAndChildrenSearchCriteria, useMotherAndChildren } from '../../hooks/useMotherAndChildren';
import { type WardPatientCard } from '../../types';
import WardPatientSkeletonText from '../row-elements/ward-pateint-skeleton-text';
import WardPatientAge from '../row-elements/ward-patient-age';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier';
import WardPatientLocation from '../row-elements/ward-patient-location';
import WardPatientName from '../row-elements/ward-patient-name';
import wardPatientCardStyles from '../ward-patient-card.scss';
import styles from './mother-child-row.scss';
import { WardPatientCardElement } from '../ward-patient-card-element.component';

const motherAndChildrenRep =
  'custom:(childAdmission,mother:(person,identifiers:full,uuid),child:(person,identifiers:full,uuid),motherAdmission)';

/**
 * This extension displays the mother or children of the patient in the patient card.
 *
 * @param param0
 * @returns
 */
const MotherChildRowExtension: WardPatientCard = (wardPatient) => {
  const { t } = useTranslation();
  const config = useConfig<{ rowElements: Array<string> }>();
  const { rowElements } = config;
  const { patient } = wardPatient;

  const getChildrenRequestParams: MothersAndChildrenSearchCriteria = {
    mothers: [patient.uuid],
    requireMotherHasActiveVisit: true,
    requireChildHasActiveVisit: true,
    requireChildBornDuringMothersActiveVisit: true,
  };

  const getMotherRequestParams: MothersAndChildrenSearchCriteria = {
    children: [patient.uuid],
    requireMotherHasActiveVisit: true,
    requireChildHasActiveVisit: true,
    requireChildBornDuringMothersActiveVisit: true,
  };

  const {
    data: childrenData,
    isLoading: isLoadingChildrenData,
    error: childrenDataError,
  } = useMotherAndChildren(getChildrenRequestParams, true, motherAndChildrenRep);
  const {
    data: motherData,
    isLoading: isLoadingMotherData,
    error: motherDataError,
  } = useMotherAndChildren(getMotherRequestParams, true, motherAndChildrenRep);

  if (isLoadingChildrenData || isLoadingMotherData) {
    return (
      <div className={classNames(styles.motherOrBabyRow, wardPatientCardStyles.wardPatientCardRow)}>
        <WardPatientSkeletonText />
      </div>
    );
  } else if (childrenDataError) {
    return (
      <InlineNotification
        kind="warning"
        lowContrast={true}
        title={t('errorLoadingChildren', 'Error loading children info')}
      />
    );
  } else if (motherDataError) {
    return (
      <InlineNotification
        kind="warning"
        lowContrast={true}
        title={t('errorLoadingChildren', 'Error loading mother info')}
      />
    );
  }

  return (
    <>
      {[...childrenData, ...motherData]?.map(({ mother, motherAdmission, child, childAdmission }) => {
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
              {rowElements?.map((elementId, i) => (
                <WardPatientCardElement
                  key={`ward-card-${patient.uuid}-mother-child-row-${i}`}
                  elementId={elementId}
                  patient={patientB}
                  visit={patientBAdmission.visit}
                  inpatientAdmission={patientBAdmission}
                  inpatientRequest={null}
                  bed={null}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MotherChildRowExtension;
