import React from 'react';
import { Button } from '@carbon/react';
import { AddIcon, launchWorkspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { serviceQueuesPatientSearchWorkspace } from '../../constants';
import { useTranslation } from 'react-i18next';
import { useServiceQueuesStore } from '../../store/store';

const AddPatientToQueueButton: React.FC = () => {
  const { t } = useTranslation();
  const { selectedServiceUuid } = useServiceQueuesStore();

  return (
    <Button
      kind="secondary"
      renderIcon={(props) => <AddIcon size={16} {...props} />}
      size="sm"
      onClick={() =>
        launchWorkspace2(
          'queue-patient-search-workspace',
          {
            initialQuery: '',
            workspaceTitle: t('addPatientToQueue', 'Add patient to queue'),
            onPatientSelected(
              patientUuid: string,
              patient: fhir.Patient,
              launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
              closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
            ) {
              launchChildWorkspace(serviceQueuesPatientSearchWorkspace, {
                currentServiceQueueUuid: selectedServiceUuid,
                selectedPatientUuid: patient.id,
              });
            },
          },
          {
            startVisitWorkspaceName: 'queue-patient-search-start-visit-workspace',
          },
        )
      }>
      {t('addPatientToQueue', 'Add patient to queue')}
    </Button>
  );
};

export default AddPatientToQueueButton;
