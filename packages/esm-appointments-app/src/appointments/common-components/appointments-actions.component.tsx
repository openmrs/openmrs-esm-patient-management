import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { TaskComplete } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

import { launchOverlay } from '../../hooks/useOverlay';
import AppointmentForm from '../forms/create-edit-form/appointments-form.component';
import CheckInButton from './checkin-button.component';
import { type MappedAppointment } from '../../types';
import { showModal } from '@openmrs/esm-framework';
import { useVisits } from '../../hooks/useVisits';
import DefaulterTracingForm from '../forms/defaulter-tracing-form/default-tracing-form.component';

dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentActionsProps {
  visits: Array<any>;
  appointment: MappedAppointment;
  scheduleType: string;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ visits, appointment, scheduleType }) => {
  const { t } = useTranslation();
  const { mutateVisit } = useVisits();
  const patientUuid = appointment.patientUuid;
  const visitDate = dayjs(appointment.dateTime);
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

  const handleOpenDefaulterForm = () => {
    launchOverlay('CCC Defaulter tracing form', <DefaulterTracingForm patientUuid={appointment.patientUuid} />);
  };

  /**
   * Renders the appropriate visit status button based on the current appointment state.
   * @returns {JSX.Element} The rendered button.
   */
  const renderVisitStatus = () => {
    const checkedOutText = t('checkedOut', 'Checked out');
    const followUpButtonText = t('launchFormUpForm', 'Follow up');

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
        const isAfterNoon = new Date().getHours() > 12;

        if (scheduleType === 'Pending' && isAfterNoon) {
          return (
            <Button onClick={handleOpenDefaulterForm} size="sm" kind="tertiary">
              {followUpButtonText}
            </Button>
          );
        }

        return <CheckInButton patientUuid={patientUuid} appointment={appointment} />;
      }

      default:
        if (!isFutureAppointment) {
          return (
            <Button onClick={handleOpenDefaulterForm} size="sm" kind="tertiary">
              {followUpButtonText}
            </Button>
          );
        }
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {renderVisitStatus()}
      {isFutureAppointment || (isTodayAppointment && (!handleCheckout || !hasActiveVisit)) ? (
        <OverflowMenu ariaLabel="Actions" size="sm" flipped>
          <OverflowMenuItem
            itemText={t('editAppointments', 'Edit Appointment')}
            onClick={() =>
              launchOverlay(
                t('editAppointments', 'Edit Appointment'),
                <AppointmentForm appointment={appointment} context="editing" />,
              )
            }
          />
        </OverflowMenu>
      ) : null}
    </div>
  );
};

export default AppointmentActions;
