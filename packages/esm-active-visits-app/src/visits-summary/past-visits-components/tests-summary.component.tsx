import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import { Encounter } from '../visit.resource';

const TestsSummary = ({ patientUuid, encounters }: { patientUuid: string; encounters: Array<Encounter> }) => {
  const filter = React.useMemo<ExternalOverviewProps['filter']>(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter.reference);
    };
  }, [encounters]);

  return (
    <ExtensionSlot
      extensionSlotName="test-results-filtered-overview"
      state={{ filter, patientUuid } as ExternalOverviewProps}
    />
  );
};

export default TestsSummary;
