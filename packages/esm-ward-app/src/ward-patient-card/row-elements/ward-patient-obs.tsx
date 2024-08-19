import { SkeletonText } from '@carbon/react';
import { type OpenmrsResource, type Patient, translateFrom, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ObsElementDefinition } from '../../config-schema';
import { useObs } from '../../hooks/useObs';
import styles from '../ward-patient-card.scss';
import { obsCustomRepresentation } from './ward-patient-obs.resource';

const wardPatientObs = (config: PatientObsElementConfig) => {
  const WardPatientObs: WardPatientCardElement = ({ patient, visit }) => {
    const { conceptUuid, onlyWithinCurrentVisit, orderBy, limit, label } = config;
    const { data, isLoading } = useObs({ patient: patient.uuid, concept: conceptUuid }, obsCustomRepresentation);
    const { t } = useTranslation();

const WardPatientObs: React.FC<WardPatientObsProps> = ({ config, patient, visit }) => {
  const { conceptUuid, onlyWithinCurrentVisit, orderBy, limit, label, labelI18nModule: labelModule } = config;
  const { data, isLoading } = useObs({ patient: patient.uuid, concept: conceptUuid }, obsCustomRepresentation);
  const { t } = useTranslation();

      const labelToDisplay =
        label != label != null ? t(label) : obsToDisplay?.[0]?.concept?.display;

    const labelToDisplay =
      label != null ? translateFrom(labelModule ?? moduleName, label) : obsToDisplay?.[0]?.concept?.display;

    const obsNodes = obsToDisplay?.map((o) => {
      const { value } = o;
      const display: any = (value as OpenmrsResource)?.display ?? o.value;
      return <span key={o.uuid}> {display} </span>;
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
