import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { type Encounter } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ patientUuid, encounters }: { patientUuid: string; encounters: Array<Encounter> }) => {
  const filter = useMemo(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter.reference);
    };
  }, [encounters]);

  return (
    <div className={classNames(styles.bodyLong01, styles.testSummaryExtension)}>
      <ExtensionSlot name="test-results-filtered-overview" state={{ filter, patientUuid }} />
    </div>
  );
};

export default TestsSummary;
