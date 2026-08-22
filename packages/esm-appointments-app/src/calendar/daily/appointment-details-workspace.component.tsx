import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type Appointment } from '../../types';
import { appointmentsFormWorkspace } from '../../constants';
import AppointmentDetails from '../../appointments/details/appointment-details.component';
import styles from './appointment-details-workspace.scss';

interface AppointmentDetailsWorkspaceProps {
  appointment: Appointment;
}

const AppointmentDetailsWorkspace: React.FC<Workspace2DefinitionProps<AppointmentDetailsWorkspaceProps>> = ({
  workspaceProps: { appointment },
}) => {
  const { t } = useTranslation();

  return (
    <Workspace2 title={t('appointmentDetails', 'Appointment details')}>
      <div className={styles.actions}>
        <Button
          kind="primary"
          onClick={() =>
            launchWorkspace2(appointmentsFormWorkspace, {
              patientUuid: appointment.patient.uuid,
              appointment,
            })
          }>
          {t('editAppointment', 'Edit appointment')}
        </Button>
      </div>
      <AppointmentDetails appointment={appointment} />
    </Workspace2>
  );
};

export default AppointmentDetailsWorkspace;
