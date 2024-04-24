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
  const { mutateVisit } = useTodaysVisits();
  const patientUuid = appointment.patient.uuid;
  const visitDate = dayjs(appointment.startDateTime);
  const isTodaysAppointment = visitDate.isToday();

  const handleCheckout = () => {
    if (checkOutButton.customUrl) {
      navigate({ to: checkOutButton.customUrl, templateParams: { patientUuid, appointmentUuid: appointment.uuid } });
    } else {
      const dispose = showModal('end-visit-dialog', {
        closeModal: () => {
          mutateVisit();
          dispose();
        },
        patientUuid,
      });
    }
  };

  const renderVisitStatus = () => {
    switch (true) {
      case isTodaysAppointment && appointment.status === AppointmentStatus.COMPLETED:
        return (
          <Button kind="ghost" renderIcon={TaskComplete} iconDescription={t('checkedOut', 'Checked out')} size="sm">
            {t('checkedOut', 'Checked out')}
          </Button>
        );
      case checkOutButton.enabled && isTodaysAppointment && appointment.status === AppointmentStatus.CHECKEDIN:
        return (
          <Button onClick={handleCheckout} kind="danger--tertiary" size="sm">
            {t('checkOut', 'Check out')}
          </Button>
        );
      case checkInButton.enabled && isTodaysAppointment && appointment.status === AppointmentStatus.SCHEDULED: {
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
