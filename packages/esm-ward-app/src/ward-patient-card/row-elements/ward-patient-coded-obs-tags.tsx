import { Tag, Tooltip, ToggletipButton } from '@carbon/react';
import { isDesktop, type OpenmrsResource, type Patient, useLayoutType, type Visit } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type ColoredObsTagsCardRowConfigObject } from '../../config-schema-extension-colored-obs-tags';
import { useObs } from '../../hooks/useObs';
import styles from '../ward-patient-card.scss';
import WardPatientSkeletonText from './ward-pateint-skeleton-text';
import { obsCustomRepresentation, useConceptToTagColorMap } from './ward-patient-obs.resource';
import { Toggletip } from '@carbon/react';
import { ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/react/icons';

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

    // for each obs configured to be displayed with a color, we create a tag for it
    // for other obs not configured, we create a single summary tag for all of them.
    const summaryTagTooltipText: ReactNode[] = [];
    const coloredOpsTags = obsToDisplay
      ?.map((o) => {
        const { display, uuid } = o.value as OpenmrsResource;

        const color = conceptToTagColorMap?.get(uuid);
        if (color) {
          return (
            <Tag type={color} key={`ward-coded-obs-tag-${o.uuid}`}>
              {display}
              <span onClick={(e) => e.stopPropagation()}>
                <Toggletip className={styles.wardPatientObsIcon}>
                  <ToggletipButton>
                    <Information />
                  </ToggletipButton>
                  <ToggletipContent>{o.encounter?.display}</ToggletipContent>
                </Toggletip>
              </span>
            </Tag>
          );
        } else {
          summaryTagTooltipText.push(
            <div key={uuid}>
              {display} ({o.encounter.display})
            </div>,
          );
          return null;
        }
      })
      .filter((o) => o != null);

    if (coloredOpsTags?.length > 0 || summaryTagTooltipText.length > 0) {
      return (
        <div className={styles.wardPatientCardRow}>
          <span className={styles.wardPatientObsLabel}>
            {coloredOpsTags}
            {summaryTagTooltipText.length > 0 ? (
              <Tag type={summaryLabelColor}>
                {t('countItems', '{{count}} {{item}}', {
                  count: summaryTagTooltipText.length,
                  item: summaryLabelToDisplay,
                })}
                <span onClick={(e) => e.stopPropagation()}>
                  <Toggletip className={styles.wardPatientObsIcon}>
                    <ToggletipButton>
                      <Information />
                    </ToggletipButton>
                    <ToggletipContent>{summaryTagTooltipText}</ToggletipContent>
                  </Toggletip>
                </span>
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
