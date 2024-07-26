import { SkeletonText, Tag } from '@carbon/react';
import { translateFrom, type OpenmrsResource } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type PatientCodedObsTagsElementConfig } from '../../config-schema';
import { moduleName } from '../../constant';
import { useObs } from '../../hooks/useObs';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';
import { obsCustomRepresentation, useConceptToTagColorMap } from './ward-patient-obs.resource';

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
const wardPatientCodedObsTags = (config: PatientCodedObsTagsElementConfig) => {
  const WardPatientCodedObsTags: WardPatientCardElement = ({ patient, visit }) => {
    const { conceptUuid, summaryLabel, summaryLabelColor} = config;
    const { data, isLoading } = useObs({ patient: patient.uuid, concept: conceptUuid }, obsCustomRepresentation);
    const { t } = useTranslation();
    const { data: conceptToTagColorMap } = useConceptToTagColorMap(config);

    if (isLoading) {
      return <SkeletonText />;
    } else {
      const obsToDisplay = data?.data?.results?.filter((o) => {
        const matchVisit = o.encounter.visit?.uuid == visit?.uuid;
        return matchVisit || visit == null; // TODO: remove visit == null hack when server API supports returning visit
      });

      const summaryLabelToDisplay =
        summaryLabel != null ? t(summaryLabel) : obsToDisplay?.[0]?.concept?.display;

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
          <div>
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

  return WardPatientCodedObsTags;
};

export default wardPatientCodedObsTags;
