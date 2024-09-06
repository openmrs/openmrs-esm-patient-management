import { Tag } from '@carbon/react';
import { type OpenmrsResource, type Patient, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ColoredObsTagsCardRowConfigObject } from '../../config-schema-extension-colored-obs-tags';
import { useObs } from '../../hooks/useObs';
import styles from '../ward-patient-card.scss';
import WardPatientSkeletonText from './ward-pateint-skeleton-text';
import { obsCustomRepresentation, useConceptToTagColorMap } from './ward-patient-obs.resource';

interface WardPatientCodedObsTagsProps {
  config: ColoredObsTagsCardRowConfigObject;
  patient: Patient;
  visit: Visit;
}

/**
 * The WardPatientCodedObsTags displays observations of coded values of a particular concept in the active visit as tags.
 * Typically, these are taken from checkbox fields from a form. Each answer value can either be configured
 * to show as its own tag, or collapsed into a summary tag show the number of these values present.
 *
 * This is a rather specialized element;
 * for a more general display of obs value, use WardPatientObs instead.
 * @param config
 * @returns
 */
const WardPatientCodedObsTags: React.FC<WardPatientCodedObsTagsProps> = ({ config, patient, visit }) => {
  const { conceptUuid, summaryLabel, summaryLabelColor } = config;
  const { data, isLoading } = useObs({ patient: patient.uuid, concept: conceptUuid }, obsCustomRepresentation);
  const { t } = useTranslation();
  const conceptToTagColorMap = useConceptToTagColorMap(config.tags);

  if (isLoading) {
    return (
      <div className={styles.wardPatientCardRow}>
        <WardPatientSkeletonText />
      </div>
    );
  } else {
    const obsToDisplay = data?.filter((o) => {
      const matchVisit = o.encounter.visit?.uuid == visit?.uuid;
      return matchVisit;
    });

    const summaryLabelToDisplay = summaryLabel != null ? t(summaryLabel) : obsToDisplay?.[0]?.concept?.display;

    const obsNodes = obsToDisplay?.map((o) => {
      const { display, uuid } = o.value as OpenmrsResource;

      const color = conceptToTagColorMap?.get(uuid);
      if (color) {
        return (
          <Tag type={color} key={`ward-coded-obs-tag-${o.uuid}`}>
            {display}
          </Tag>
        );
      } else {
        return null;
      }
    });

    const obsWithNoTagCount = obsNodes.filter((o) => o == null).length;
    if (obsNodes?.length > 0 || obsWithNoTagCount > 0) {
      return (
        <div className={styles.wardPatientCardRow}>
          <span className={styles.wardPatientObsLabel}>
            {obsNodes}
            {obsWithNoTagCount > 0 ? (
              <Tag type={summaryLabelColor}>
                {t('countItems', '{{count}} {{item}}', { count: obsWithNoTagCount, item: summaryLabelToDisplay })}
              </Tag>
            ) : null}
          </span>
        </div>
      );
    } else {
      return null;
    }
  }
};

export default WardPatientCodedObsTags;
