import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { Button } from '@carbon/react';
import { TaskComplete } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { navigate, showModal, useConfig } from '@openmrs/esm-framework';
import { type Appointment, AppointmentStatus } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { useTodaysVisits } from '../../hooks/useTodaysVisits';
import CheckInButton from './checkin-button.component';
import styles from './appointments-actions.scss';

dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentsActionsProps {
  appointment: Appointment;
}

const AppointmentsActions: React.FC<AppointmentsActionsProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { checkInButton, checkOutButton } = useConfig<ConfigObject>();
  const { visits, mutateVisit } = useTodaysVisits(); // TODO doesn't work if visit didn't start today?  what about inpatient?
  const patientUuid = appointment.patient.uuid;
  const visitDate = dayjs(appointment.startDateTime);
  const hasActiveVisitToday = visits?.some(
    (visit) => visit?.patient?.uuid === patientUuid && visit?.startDatetime && !visit?.stopDatetime,
  );
  const isTodaysAppointment = visitDate.isToday();
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;

  const handleCheckout = () => {
    if (checkOutButton.customUrl) {
      navigate({ to: checkOutButton.customUrl, templateParams: { patientUuid, appointmentUuid: appointment.uuid } });
    } else {
      const dispose = showModal('end-appointment-modal', {
        closeModal: () => {
          mutateVisit();
          dispose();
        },
        patientUuid,
        appointmentUuid: appointment.uuid,
      });
    }
  };

  const renderVisitStatus = () => {
    switch (true) {
      case isCancelled:
        return (
          <Button kind="danger--ghost" iconDescription={t('cancelled', 'Cancelled')} size="sm">
            {t('cancelled', 'Cancelled')}
          </Button>
        );
      case isCompleted:
        return (
          <Button kind="ghost" renderIcon={TaskComplete} iconDescription={t('checkedOut', 'Checked out')} size="sm">
            {t('checkedOut', 'Checked out')}
          </Button>
        );
      case checkOutButton.enabled && hasActiveVisitToday && isTodaysAppointment:
        return (
          <Button onClick={handleCheckout} kind="danger--tertiary" size="sm">
            {t('checkOut', 'Check out')}
          </Button>
        );
      case checkInButton.enabled && !hasActiveVisitToday && isTodaysAppointment: {
        return <CheckInButton patientUuid={patientUuid} appointment={appointment} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <>{renderVisitStatus()}</>
    </div>
  );
};

export default AppointmentsActions;
