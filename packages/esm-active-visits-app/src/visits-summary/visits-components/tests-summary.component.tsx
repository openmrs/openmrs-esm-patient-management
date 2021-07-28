import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Encounter } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

const TestsSummary = ({ patientUuid, encounters }: { patientUuid: string; encounters: Array<Encounter> }) => {
  const filter = React.useMemo(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter.reference);
    };
  }, [encounters]);

  return (
    <div className={`${styles.bodyLong01} ${styles.testSummaryExtension}`}>
      <ExtensionSlot extensionSlotName="test-results-filtered-overview" state={{ filter, patientUuid }} />
    </div>
  );
};

export default TestsSummary;
