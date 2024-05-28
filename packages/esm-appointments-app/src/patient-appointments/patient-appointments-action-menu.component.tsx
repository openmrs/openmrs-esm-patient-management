import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { launchWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import type { Appointment } from '../types';
import styles from './patient-appointments-action-menu.scss';

import PatientAppointmentContext, { PatientAppointmentContextTypes } from '../hooks/patientAppointmentContext';

interface appointmentsActionMenuProps {
  appointment: Appointment;
  patientUuid: string;
}

export const PatientAppointmentsActionMenu = ({ appointment, patientUuid }: appointmentsActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const patientAppointmentContext = useContext(PatientAppointmentContext);

  const launchEditAppointmentForm = useCallback(() => {
    if (patientAppointmentContext === PatientAppointmentContextTypes.PATIENT_CHART) {
      launchPatientWorkspace('appointments-form-workspace', {
        workspaceTitle: t('editAppointment', 'Edit an appointment'),
        appointment,
        context: 'editing',
      });
    } else {
      launchWorkspace('edit-appointments-form', {
        context: 'editing',
        appointment,
      });
    }
  }, [appointment, t]);

  const launchCancelAppointmentDialog = () => {
    const dispose = showModal('patient-appointment-cancel-confirmation-dialog', {
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
          onClick={launchEditAppointmentForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="cancelAppointment"
          itemText={t('cancel', 'Cancel')}
          onClick={launchCancelAppointmentDialog}
          isDelete={true}
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
