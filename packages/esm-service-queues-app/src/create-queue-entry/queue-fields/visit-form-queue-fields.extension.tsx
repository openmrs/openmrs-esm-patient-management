import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig, UserHasAccess, type Visit } from '@openmrs/esm-framework';
import QueueFields from './queue-fields.component';
import { type ConfigObject } from '../../config-schema';

export const PRIVILEGE_RDE_ACCESS = 'App: patientmanagement.rde';

interface VisitFormCallbacks {
  onVisitCreatedOrUpdated: (visit: Visit) => Promise<any>;
}
// See VisitFormExtensionState in esm-patient-chart-app
export interface VisitFormQueueFieldsProps {
  setVisitFormCallbacks: (callbacks: VisitFormCallbacks) => void;
  visitFormOpenedFrom: string;
  patientChartConfig?: {
    showServiceQueueFields: boolean;
  };
  patientUuid: string;
}

/**
 * This extension contains form fields for starting a patient's queue entry.
 * It is used slotted into the patient-chart's start visit form.
 *
 * RDE-related fields are only shown when the user has the
 * 'App: patientmanagement.rde' privilege.
 */
const VisitFormQueueFields: React.FC<VisitFormQueueFieldsProps> = (props) => {
  const config = useConfig<ConfigObject>();
  const { watch } = useFormContext();
  const { setVisitFormCallbacks, visitFormOpenedFrom, patientChartConfig } = props;

  const isRetrospective = watch('retrospective');

  if (
    (patientChartConfig.showServiceQueueFields || visitFormOpenedFrom === 'service-queues-add-patient') &&
    !isRetrospective
  ) {
    return (
      <UserHasAccess privilege={PRIVILEGE_RDE_ACCESS}>
        <QueueFields
          setOnSubmit={(onSubmit) => setVisitFormCallbacks({ onVisitCreatedOrUpdated: onSubmit })}
          defaultInitialServiceQueue={config.defaultInitialServiceQueue}
        />
      </UserHasAccess>
    );
  } else {
    return <></>;
  }
};

export default VisitFormQueueFields;
