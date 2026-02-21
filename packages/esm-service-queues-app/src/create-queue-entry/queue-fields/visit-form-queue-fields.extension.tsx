import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useConfig, type Visit } from '@openmrs/esm-framework';
import QueueFields from './queue-fields.component';
import { type ConfigObject } from '../../config-schema';

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
 * Queue fields are only useful for non-retrospective visits, so they are
 * hidden when the visit status is 'past' (i.e., a retrospective visit).
 */
const VisitFormQueueFields: React.FC<VisitFormQueueFieldsProps> = (props) => {
  const config = useConfig<ConfigObject>();
  const { watch } = useFormContext();
  const { setVisitFormCallbacks, visitFormOpenedFrom, patientChartConfig } = props;

  const visitStatus = watch('visitStatus');
  const isRetrospective = visitStatus === 'past';

  if (
    (patientChartConfig.showServiceQueueFields || visitFormOpenedFrom === 'service-queues-add-patient') &&
    !isRetrospective
  ) {
    return (
      <QueueFields
        setOnSubmit={(onSubmit) => setVisitFormCallbacks({ onVisitCreatedOrUpdated: onSubmit })}
        defaultInitialServiceQueue={config.defaultInitialServiceQueue}
      />
    );
  } else {
    return <></>;
  }
};

export default VisitFormQueueFields;
