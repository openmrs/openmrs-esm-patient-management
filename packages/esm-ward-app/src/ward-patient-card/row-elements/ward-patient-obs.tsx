import { SkeletonText, Tag } from '@carbon/react';
import { type OpenmrsResource, translateFrom } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type PatientObsElementConfig } from '../../config-schema';
import { useObs } from '../../hooks/useObs';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';
import { moduleName } from '../../constant';

// prettier-ignore
const obsCustomRepresentation = 
  'custom:(uuid,display,obsDatetime,value,' + 
    'concept:(uuid,display),' + 
    'encounter:(uuid,display,' + 
      'visit:(uuid,display)))';

const wardPatientObs = (config: PatientObsElementConfig) => {
  const WardPatientObs: WardPatientCardElement = ({ patient, visit }) => {
    const {
      conceptUuid,
      onlyWithinCurrentVisit,
      orderBy,
      limit,
      label,
      labelI18nModule: labelModule,
      displayType,
    } = config;
    const { data, isLoading } = useObs({ patient: patient.uuid, concept: conceptUuid }, obsCustomRepresentation);
    const { t } = useTranslation();

    if (isLoading) {
      return <SkeletonText />;
    } else {
      const obsToDisplay = data?.data?.results
        ?.filter((o) => {
          const matchVisit = !onlyWithinCurrentVisit || o.encounter.visit?.uuid == visit?.uuid;
          return matchVisit;
        })
        ?.sort((obsA, obsB) => {
          return (orderBy == 'descending' ? -1 : 1) * obsA.obsDatetime.localeCompare(obsB.obsDatetime);
        })
        ?.slice(0, limit ?? Number.MAX_VALUE);

      const labelToDisplay =
        label != null ? translateFrom(labelModule ?? moduleName, label) : obsToDisplay?.[0]?.concept?.display;

      const obsNodes = obsToDisplay?.map((o) => {
        const { value } = o;
        const display: any = (value as OpenmrsResource)?.display ?? o.value;
        if (displayType == 'tags') {
          return <Tag>{display}</Tag>;
        } else {
          return <span> {display} </span>;
        }
      });

      return (
        <div>
          <span className={styles.wardPatientObsLabel}>
            {labelToDisplay ? t('labelColon', '{{label}}:', { label: labelToDisplay }) : ''}
          </span>
          {obsNodes}
        </div>
      );
    }
  };

  return WardPatientObs;
};

export default wardPatientObs;
