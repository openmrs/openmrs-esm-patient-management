import { showModal, showNotification, showActionableNotification, restBaseUrl } from '@openmrs/esm-framework';
import { updateAppointmentStatus, undoAppointmentStatus } from './home-appointments.resource';

export const launchCheckInAppointmentModal = (appointmentUuid: string) => {
  const dispose = showModal('check-in-appointment-modal', {
    closeCheckInModal: () => dispose(),
    appointmentUuid,
  });
};

export const handleUndoAction = async (appointmentUuid, mutate) => {
  const { status } = await undoAppointmentStatus(appointmentUuid);
  if (status === 200) {
    mutate();
  } else {
    showNotification({
      title: 'Error Undoing',
      kind: 'error',
      critical: true,
      description: 'Error reverting status',
    });
  }
};

export const handleUpdateStatus = async (
  toStatus: string,
  appointmentUuid: string,
  successDescription: string,
  errorDescription: string,
  successTitle: string,
  errorTitle: string,
  mutate,
  t,
) => {
  const { status } = await updateAppointmentStatus(toStatus, appointmentUuid);
  if (status === 200) {
    showActionableNotification({
      critical: true,
      kind: 'success',
      subtitle: successDescription,
      title: successTitle,
      actionButtonLabel: t('undo', 'Undo'),
      progressActionLabel: t('revertingAppointmentStatus', 'Reverting appointment status'),
      onActionButtonClick: () => handleUndoAction(appointmentUuid, mutate),
    });
    mutate();
  } else {
    showNotification({
      title: errorTitle,
      kind: 'error',
      critical: true,
      description: errorDescription,
    });
  }
};

export const handleComplete = (appointmentId, mutate, t) => {
  const successDescription = t('appointmentMarkedAsCompleted', 'It has been successfully marked as Completed');
  const successTitle = t('appointmentCompleted', 'Appointment Completed');
  const errorDescription = t('appointmentCompleted', 'Appointment Completed');
  const errorTitle = t('appointmentCompletedError', 'Error marking appointment as Completed');
  return handleUpdateStatus(
    'Completed',
    appointmentId,
    successDescription,
    errorDescription,
    successTitle,
    errorTitle,
    mutate,
    t,
  );
};
