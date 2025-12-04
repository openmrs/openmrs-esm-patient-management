import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { useTranslation } from 'react-i18next';
import { Calendar, Hospital } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import {
  ExtensionSlot,
  isDesktop,
  launchWorkspace2,
  navigate,
  useLayoutType,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { appointmentsFormWorkspace, spaHomePage } from '../constants';
import { useAppointmentsStore } from '../store';
import styles from './metrics-header.scss';

dayjs.extend(isToday);

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'md';

  const launchCreateAppointmentForm = (patientUuid) => {
    const props = {
      patientUuid: patientUuid,
      context: 'creating',
      mutate: () => {}, // TODO get this to mutate properly
    };

    launchWorkspace2('appointments-form-workspace', { ...props });
  };

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.metricsContent}>
        <Button
          kind="tertiary"
          renderIcon={Calendar}
          size={responsiveSize}
          onClick={() =>
            navigate({ to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).format('YYYY-MM-DD')}` })
          }>
          {t('appointmentsCalendar', 'Appointments calendar')}
        </Button>
        <Button
          kind="primary"
          renderIcon={(props) => <Hospital size={32} {...props} />}
          size={responsiveSize}
          onClick={() =>
            launchWorkspace2(
              'appointments-patient-search-workspace',
              {
                initialQuery: '',
                workspaceTitle: t('createNewAppointment', 'Create new appointment'),
                onPatientSelected(
                  patientUuid: string,
                  patient: fhir.Patient,
                  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
                  closeWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
                ) {
                  launchChildWorkspace(appointmentsFormWorkspace, {
                    selectedPatientUuid: patient.id,
                  });
                },
              },
              {
                startVisitWorkspaceName: 'appointments-patient-search-start-visit-workspace',
              },
            )
          }>
          {t('createNewAppointment', 'Create new appointment')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
