import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { TaskComplete } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { closeOverlay, launchOverlay } from '../../hooks/useOverlay';
import { type Appointment } from '../../types';
import { showModal } from '@openmrs/esm-framework';
import { useVisits } from '../../hooks/useVisits';
import AppointmentForm from '../../form/appointments-form.component';
import CheckInButton from './checkin-button.component';

dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentActionsProps {
  visits: Array<any>;
  appointment: Appointment;
  scheduleType: string;
  mutate: () => void;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ visits, appointment, mutate }) => {
  const { t } = useTranslation();
  const { mutateVisit } = useVisits();
  const patientUuid = appointment.patient.uuid;
  const visitDate = dayjs(appointment.startDateTime);
  const isFutureAppointment = visitDate.isAfter(dayjs());
  const isTodayAppointment = visitDate.isToday();
  const hasActiveVisit = visits?.some((visit) => visit?.patient?.uuid === patientUuid && visit?.startDatetime);
  const hasCheckedOut = visits?.some(
    (visit) => visit?.patient?.uuid === patientUuid && visit?.startDatetime && visit?.stopDatetime,
  );

  const handleCheckout = () => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => {
        mutateVisit();
        dispose();
      },
      patientUuid,
    });
  };

  /**
   * Renders the appropriate visit status button based on the current appointment state.
   * @returns {JSX.Element} The rendered button.
   */
  const renderVisitStatus = () => {
    const checkedOutText = t('checkedOut', 'Checked out');

    switch (true) {
      case hasCheckedOut:
        return (
          <Button size="sm" kind="ghost" renderIcon={TaskComplete} iconDescription="Add">
            {checkedOutText}
          </Button>
        );
      case hasActiveVisit && isTodayAppointment:
        return (
          <Button onClick={handleCheckout} size="sm" kind="danger--tertiary">
            {t('checkOut', 'Check out')}
          </Button>
        );
      case isTodayAppointment: {
        return <CheckInButton patientUuid={patientUuid} appointment={appointment} />;
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {renderVisitStatus()}
      {isFutureAppointment || (isTodayAppointment && (!handleCheckout || !hasActiveVisit)) ? (
        <OverflowMenu aria-label="Actions" iconDescription={t('actions', 'Actions')} size="sm" flipped>
          <OverflowMenuItem
            itemText={t('editAppointments', 'Edit Appointment')}
            onClick={() =>
              launchOverlay(
                t('editAppointments', 'Edit Appointment'),
                <AppointmentForm
                  appointment={appointment}
                  context="editing"
                  closeWorkspace={closeOverlay}
                  mutate={mutate}
                />,
              )
            }
          />
        </OverflowMenu>
      ) : null}
    </div>
  );
};

export default AppointmentActions;
