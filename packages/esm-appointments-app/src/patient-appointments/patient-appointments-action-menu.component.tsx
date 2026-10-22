import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import type { Appointment } from '../types';
import styles from './patient-appointments-action-menu.scss';

interface appointmentsActionMenuProps {
  appointment: Appointment;
  patientUuid: string;

  /**
   * Optional callback to launch the appropriate appointments form workspace, depending
   * on which app is using this component. If not provided, defaults to launching the
   * standalone appointments form workspace.
   */
  launchAppointmentForm?(patientUuid: string, appointment?: Appointment): void;
}

export const PatientAppointmentsActionMenu = ({
  appointment,
  patientUuid,
  launchAppointmentForm,
}: appointmentsActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const handleLaunchEditAppointmentForm = () => {
    if (launchAppointmentForm) {
      launchAppointmentForm(patientUuid, appointment);
    } else {
      launchWorkspace2('appointments-form-workspace', { appointment, patientUuid });
    }
  };

  const handleLaunchCancelAppointmentModal = () => {
    const dispose = showModal('cancel-appointment-modal', {
      closeCancelModal: () => dispose(),
      appointmentUuid: appointment.uuid,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label="Edit or delete appointment" size={isTablet ? 'lg' : 'sm'} flipped align="left">
        <OverflowMenuItem
          className={styles.menuItem}
          id="editAppointment"
          itemText={t('edit', 'Edit')}
          onClick={handleLaunchEditAppointmentForm}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          hasDivider
          id="cancelAppointment"
          isDelete={true}
          itemText={t('cancel', 'Cancel')}
          onClick={handleLaunchCancelAppointmentModal}
        />
      </OverflowMenu>
    </Layer>
  );
};
