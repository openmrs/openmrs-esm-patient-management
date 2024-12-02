import { Tag } from '@carbon/react';
import { type OpenmrsResource, type Patient, type Visit } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useObs } from '../../hooks/useObs';
import { useElementConfig } from '../../ward-view/ward-view.resource';
import styles from '../ward-patient-card.scss';
import WardPatientSkeletonText from '../row-elements/ward-patient-skeleton-text';
import {
  getObsEncounterString,
  obsCustomRepresentation,
  useConceptToTagColorMap,
} from '../row-elements/ward-patient-obs.resource';
import WardPatientResponsiveTooltip from '../row-elements/ward-patient-responsive-tooltip';

interface WardPatientCodedObsTagsRowProps {
  id: string;
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
const CodedObsTagsRow: React.FC<WardPatientCodedObsTagsRowProps> = ({ id, patient, visit }) => {
  const config = useElementConfig('coloredObsTags', id);
  const { conceptUuid, summaryLabel, summaryLabelColor } = config ?? {};
  const { data, isLoading } = useObs(
    { patient: patient.uuid, concept: conceptUuid },
    conceptUuid != null,
    obsCustomRepresentation,
  );
  const { t } = useTranslation();
  const conceptToTagColorMap = useConceptToTagColorMap(config?.tags ?? []);

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
            <WardPatientResponsiveTooltip tooltipContent={getObsEncounterString(o, t)}>
              <Tag type={color} key={`ward-coded-obs-tag-${o.uuid}`}>
                {display}
              </Tag>
            </WardPatientResponsiveTooltip>
          );
        } else {
          summaryTagTooltipText.push(
            <div key={uuid}>
              {display} ({getObsEncounterString(o, t)})
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
              <WardPatientResponsiveTooltip tooltipContent={summaryTagTooltipText}>
                <Tag type={summaryLabelColor}>
                  {t('countItems', '{{count}} {{item}}', {
                    count: summaryTagTooltipText.length,
                    item: summaryLabelToDisplay,
                  })}
                </Tag>
              </WardPatientResponsiveTooltip>
            ) : null}
          </span>
        </div>
      );
    } else {
      return null;
    }
  }
};

export default CodedObsTagsRow;
