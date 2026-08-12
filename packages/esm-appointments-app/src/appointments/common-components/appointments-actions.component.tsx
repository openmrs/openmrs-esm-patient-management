import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { navigate, showModal, useConfig } from '@openmrs/esm-framework';
import { type Appointment, AppointmentStatus } from '../../types';
import { type ConfigObject } from '../../config-schema';
import CheckInButton from './checkin-button.component';
import styles from './appointments-actions.scss';

interface AppointmentsActionsProps {
  appointment: Appointment;
  hasActiveVisit: boolean;
  mutateVisits: () => void;
}

const AppointmentsActions: React.FC<AppointmentsActionsProps> = ({ appointment, hasActiveVisit, mutateVisits }) => {
  const { t } = useTranslation();
  const { checkInButton, checkOutButton } = useConfig<ConfigObject>();

  const patientUuid = appointment.patient.uuid;

  const isCheckedIn = appointment.status === AppointmentStatus.CHECKEDIN;
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;
  const isScheduled = appointment.status === AppointmentStatus.SCHEDULED;

  const handleCheckout = () => {
    if (checkOutButton.customUrl) {
      navigate({
        to: checkOutButton.customUrl,
        templateParams: {
          patientUuid,
          appointmentUuid: appointment.uuid,
        },
      });
    } else {
      const dispose = showModal('end-appointment-modal', {
        closeModal: () => {
          mutateVisits();
          dispose();
        },
        patientUuid,
        appointmentUuid: appointment.uuid,
      });
    }
  };

  const renderActions = () => {
    if (isCancelled || isCompleted) {
      return null;
    }

    if (checkOutButton.enabled && isCheckedIn) {
      return (
        <Button onClick={handleCheckout} kind="danger--tertiary" size="sm">
          {t('checkOut', 'Check out')}
        </Button>
      );
    }

    if (isScheduled && checkInButton.enabled) {
      return (
        <CheckInButton
          patientUuid={patientUuid}
          appointment={appointment}
          hasActiveVisit={hasActiveVisit}
          mutateVisits={mutateVisits}
        />
      );
    }

    return null;
  };

  return <div className={styles.container}>{renderActions()}</div>;
};

export default AppointmentsActions;
