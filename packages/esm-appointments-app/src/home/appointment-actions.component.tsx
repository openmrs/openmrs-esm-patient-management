import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { isDesktop, navigate, useConfig } from '@openmrs/esm-framework';
import type { Appointment } from '../types';
import { closeOverlay, launchOverlay } from '../hooks/useOverlay';
import { spaHomePage } from '../constants';
import { launchCheckInAppointmentModal, handleUpdateStatus, handleComplete } from './common';
import AppointmentForm from '../form/appointments-form.component';
import CancelAppointment from '../appointments/forms/cancel-form/cancel-appointment.component';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './index.scss';
import { useMutateAppointments } from '../form/appointments-form.resource';

interface ActionMenuProps {
  appointment: Appointment;
  useBahmniUI?: string;
}

export const ActionsMenu = ({ appointment, useBahmniUI }: ActionMenuProps) => {
  const { t } = useTranslation();
  const { bahmniAppointmentsUiBaseUrl } = useConfig();
  const { mutateAppointments } = useMutateAppointments();

  const { status } = appointment;
  const disableActions = status === 'Completed' || status === 'Missed' || status === 'Cancelled';
  const isScheduled = status === 'Scheduled' || status === 'Requested';

  const onMissed = () => {
    const successDescription = t('appointmentMarkedAsMissed', 'It has been successfully marked as Missed');
    const successTitle = t('appointmentMissed', 'Appointment Missed');
    const errorDescription = t('appointmentMissed', 'Appointment Missed');
    const errorTitle = t('appointmentMissedError', 'Error marking appointment as Missed');
    return handleUpdateStatus(
      'Missed',
      appointment.uuid,
      successDescription,
      errorDescription,
      successTitle,
      errorTitle,
      mutateAppointments,
      t,
    );
  };

  const EditOverflowItem = () =>
    useBahmniUI ? (
      <OverflowMenuItem
        className={styles.menuItemLink}
        id="#editAppointment"
        target="_blank"
        href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar/${appointment.uuid}?isRecurring=${appointment.recurring}`} //TODO will this stil work/do we still need this?
        itemText={t('editAppointment', 'Edit Appointment')}>
        {t('editAppointment', 'Edit Appointment')}
      </OverflowMenuItem>
    ) : (
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editAppointment"
        onClick={() => {
          navigate({ to: `${spaHomePage}` });
          launchOverlay(
            t('editAppointment', 'Edit Appointment'),
            <AppointmentForm appointment={appointment} context="editing" closeWorkspace={closeOverlay} />,
          );
        }}
        itemText={t('editAppointment', 'Edit Appointment')}>
        {t('editAppointment', 'Edit Appointment')}
      </OverflowMenuItem>
    );

  const AddOverflowItem = () =>
    useBahmniUI ? (
      <OverflowMenuItem
        className={styles.menuItemLink}
        id="#createAppointment"
        target="_blank"
        href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar/new`}
        itemText={t('addNewAppointment', 'Add new appointment')}>
        {t('addNewAppointment', 'Add new appointment')}
      </OverflowMenuItem>
    ) : (
      <OverflowMenuItem
        className={styles.menuItem}
        id="#createAppointment"
        onClick={() => {
          navigate({ to: `${spaHomePage}` });
          launchOverlay(t('search', 'Search'), <PatientSearch />);
        }}
        itemText={t('addNewAppointment', 'Add new appointment')}>
        {t('addNewAppointment', 'Add new appointment')}
      </OverflowMenuItem>
    );

  return (
    <Layer>
      <OverflowMenu
        align="left"
        aria-label="Options"
        selectorPrimaryFocus={'#editPatientDetails'}
        size={isDesktop ? 'sm' : 'lg'}
        flipped>
        <EditOverflowItem />
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={status === 'CheckedIn' || disableActions}
          id="#checkInAppointment"
          onClick={() => launchCheckInAppointmentModal(appointment.uuid)}
          itemText={t('checkIn', 'Check In')}>
          {t('checkIn', 'Check In')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#completeAppointment"
          disabled={isScheduled || disableActions}
          onClick={() => handleComplete(appointment.uuid, mutateAppointments, t)}
          itemText={t('complete', 'Complete')}>
          {t('complete', 'Complete')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={disableActions}
          id="#missedAppointment"
          onClick={onMissed}
          itemText={t('missed', 'Missed')}>
          {t('missed', 'Missed')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#cancelAppointment"
          disabled={disableActions}
          onClick={() => {
            navigate({ to: `${spaHomePage}` });
            launchOverlay(
              t('cancelAppointment', 'Cancel Appointment'),
              <CancelAppointment appointment={appointment} />,
            );
          }}
          itemText={t('cancel', 'Cancel')}>
          {t('cancel', 'Cancel')}
        </OverflowMenuItem>
        <AddOverflowItem />
      </OverflowMenu>
    </Layer>
  );
};
