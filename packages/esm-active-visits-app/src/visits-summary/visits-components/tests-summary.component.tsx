import React, { useMemo } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { type Encounter } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ patientUuid, encounters }: { patientUuid: string; encounters: Array<Encounter> }) => {
  const filter = useMemo(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter?.reference);
    };
  }, [encounters]);

  return (
    <div className={styles.bodyLong01}>
      <ExtensionSlot name="test-results-filtered-overview-slot" state={{ filter, patientUuid }} />
    </div>
  );
};

export default TestsSummary;
