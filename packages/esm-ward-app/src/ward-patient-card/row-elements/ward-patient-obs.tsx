import { SkeletonText, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import { type OpenmrsResource, type Patient, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ObsElementDefinition } from '../../config-schema';
import { useObs } from '../../hooks/useObs';
import styles from '../ward-patient-card.scss';
import { obsCustomRepresentation } from './ward-patient-obs.resource';

export interface WardPatientObsProps {
  config: ObsElementDefinition;
  patient: Patient;
  visit: Visit;
}

const WardPatientObs: React.FC<WardPatientObsProps> = ({ config, patient, visit }) => {
  const { conceptUuid, onlyWithinCurrentVisit, orderBy, limit, label } = config;
  const { data, isLoading } = useObs({ patient: patient.uuid, concept: conceptUuid }, obsCustomRepresentation);
  const { t } = useTranslation();

  if (isLoading) {
    return <SkeletonText />;
  } else {
    const obsToDisplay = data
      ?.filter((o) => {
        const matchVisit = !onlyWithinCurrentVisit || o.encounter.visit?.uuid == visit?.uuid;
        return matchVisit;
      })
      ?.sort((obsA, obsB) => {
        return (orderBy == 'descending' ? -1 : 1) * obsA.obsDatetime.localeCompare(obsB.obsDatetime);
      })
      ?.slice(0, limit == 0 ? Number.MAX_VALUE : limit);

    const labelToDisplay = label != null ? t(label) : obsToDisplay?.[0]?.concept?.display;

    const obsNodes = obsToDisplay?.map((o) => {
      const { value } = o;
      const display: any = (value as OpenmrsResource)?.display ?? o.value;
      return (
        <span key={o.uuid}>
          {display}
          <span onClick={(e) => e.stopPropagation()}>
            <Toggletip className={styles.wardPatientObsIcon} onClick={(e) => e.stopPropagation()}>
              <ToggletipButton>
                <Information />
              </ToggletipButton>
              <ToggletipContent>{o.encounter?.display}</ToggletipContent>
            </Toggletip>
          </span>
        </span>
      );
    });

    if (obsNodes?.length > 0) {
      return (
        <div>
          <span className={styles.wardPatientObsLabel}>
            {labelToDisplay ? t('labelColon', '{{label}}:', { label: labelToDisplay }) : ''}
          </span>
          {obsNodes}
        </div>
      );
    } else {
      return null;
    }
  }
};

export default WardPatientObs;
