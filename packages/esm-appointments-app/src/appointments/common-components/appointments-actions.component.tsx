import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { Button } from '@carbon/react';
import { TaskComplete } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { navigate, showModal, useConfig } from '@openmrs/esm-framework';
import { type Appointment } from '../../types';
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
  const { visits, mutateVisit } = useTodaysVisits();
  const patientUuid = appointment.patient.uuid;
  const visitDate = dayjs(appointment.startDateTime);
  const hasActiveVisitToday = visits?.some((visit) => visit?.patient?.uuid === patientUuid && visit?.startDatetime);
  const hasCheckedOutToday = visits?.some(
    (visit) => visit?.patient?.uuid === patientUuid && visit?.startDatetime && visit?.stopDatetime,
  );
  const isTodaysAppointment = visitDate.isToday();
  const isCancelled = appointment.status === 'Cancelled';

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
      case hasCheckedOutToday && isTodaysAppointment && !isCancelled:
        return (
          <Button kind="ghost" renderIcon={TaskComplete} iconDescription={t('checkedOut', 'Checked out')} size="sm">
            {t('checkedOut', 'Checked out')}
          </Button>
        );
      case checkOutButton.enabled && hasActiveVisitToday && isTodaysAppointment && !isCancelled:
        return (
          <Button onClick={handleCheckout} kind="danger--tertiary" size="sm">
            {t('checkOut', 'Check out')}
          </Button>
        );
      case checkInButton.enabled && !hasActiveVisitToday && isTodaysAppointment && !isCancelled: {
        return <CheckInButton patientUuid={patientUuid} appointment={appointment} />;
      }
      case isCancelled:
        return (
          <Button kind="danger--ghost" iconDescription={t('cancelled', 'Cancelled')} size="sm">
            {t('cancelled', 'Cancelled')}
          </Button>
        );

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
