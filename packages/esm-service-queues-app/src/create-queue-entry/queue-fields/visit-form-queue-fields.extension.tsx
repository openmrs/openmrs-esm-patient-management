import { type Visit } from '@openmrs/esm-framework';
import React from 'react';
import QueueFields from './queue-fields.component';

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
 * It is used slotted into the patient-chart's start visit form
 */
const VisitFormQueueFields: React.FC<VisitFormQueueFieldsProps> = (props) => {
  const { setVisitFormCallbacks, visitFormOpenedFrom, patientChartConfig } = props;
  if (patientChartConfig.showServiceQueueFields || visitFormOpenedFrom == 'service-queues-add-patient') {
    return <QueueFields setOnSubmit={(onSubmit) => setVisitFormCallbacks({ onVisitCreatedOrUpdated: onSubmit })} />;
  } else {
    return <></>;
  }
};

export default VisitFormQueueFields;
