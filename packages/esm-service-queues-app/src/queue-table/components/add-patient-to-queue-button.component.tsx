import React from 'react';
import { Button } from '@carbon/react';
import { launchWorkspace2, useConfig, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import CheckedInPatients from '../../create-queue-entry/checked-in-patients/checked-in-patients.component';
import { useServiceQueuesStore } from '../../store/store';
import { serviceQueuesPatientSearchWorkspace } from '../../constants';
import { type ConfigObject } from '../../config-schema';

const AddPatientToQueueButton: React.FC = () => {
  const { t } = useTranslation();
  const { selectedServiceUuid } = useServiceQueuesStore();
  const { showCheckedInPatientsBeforeSearch } = useConfig<ConfigObject>();

  return (
    <Button
      kind="ghost"
      size="sm"
      onClick={() => {
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
            ...(showCheckedInPatientsBeforeSearch && {
              preSearchContent: ({
                onPatientSelected,
                launchChildWorkspace,
                closeWorkspace,
              }: React.ComponentProps<typeof CheckedInPatients>) => (
                <CheckedInPatients
                  onPatientSelected={onPatientSelected}
                  launchChildWorkspace={launchChildWorkspace}
                  closeWorkspace={closeWorkspace}
                />
              ),
            }),
          },
          {
            startVisitWorkspaceName: 'queue-patient-search-start-visit-workspace',
          },
        );
      }}>
      {t('addAPatientToThisList', 'Add a patient to this list')}
    </Button>
  );
};

export default AddPatientToQueueButton;
