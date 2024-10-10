import { SkeletonText } from '@carbon/react';
import { type OpenmrsResource, type Patient, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ObsElementConfig } from '../../config-schema';
import { useObs } from '../../hooks/useObs';
import styles from '../ward-patient-card.scss';
import { getObsEncounterString, obsCustomRepresentation } from './ward-patient-obs.resource';
import WardPatientResponsiveTooltip from './ward-patient-responsive-tooltip';
import { useElementConfig } from '../../ward-view/ward-view.resource';

export interface WardPatientObsProps {
  id: string;
  configOverride?: ObsElementConfig;
  patient: Patient;
  visit: Visit;
}

const WardPatientObs: React.FC<WardPatientObsProps> = ({ id, configOverride, patient, visit }) => {
  const config: ObsElementConfig = useElementConfig('obs', id);
  const configToUse = configOverride ?? config;
  const { conceptUuid, onlyWithinCurrentVisit, orderBy, limit, label } = configToUse ?? {};
  const { data, isLoading } = useObs(
    { patient: patient.uuid, concept: conceptUuid },
    conceptUuid != null,
    obsCustomRepresentation,
  );
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

      const tooltipContent = getObsEncounterString(o, t);
      return (
        <WardPatientResponsiveTooltip key={o.uuid} tooltipContent={tooltipContent}>
          <span title={tooltipContent}>{display} </span>
        </WardPatientResponsiveTooltip>
      );
    });

    if (obsNodes?.length > 0) {
      return (
        <div>
          <span className={styles.wardPatientObsLabel}>
            {labelToDisplay ? t('labelColon', '{{label}}:', { label: labelToDisplay }) : ''}
          </span>
          <div className={styles.dotSeparatedChildren}>{obsNodes}</div>
        </div>
      );
    } else {
      return null;
    }
  }
};

export default WardPatientObs;
