import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { closeOverlay } from '../../../hooks/useOverlay';

interface DefaulterTracingForm {
  patientUuid: string;
}

const DefaulterTracingForm: React.FC<DefaulterTracingForm> = ({ patientUuid }) => {
  const { patient } = usePatient(patientUuid);

  const state = useMemo(
    () => ({
      view: 'form',
      formUuid: 'a1a62d1e-2def-11e9-b210-d663bd873d93', // Defaulter Tracing Form Uuid
      visitUuid: '',
      visitTypeUuid: '',
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: '',
      closeWorkspace: closeOverlay,
    }),
    [patientUuid, patient],
  );

  return <>{patient && <ExtensionSlot extensionSlotName="form-widget-slot" state={state} />}</>;
};

export default DefaulterTracingForm;
