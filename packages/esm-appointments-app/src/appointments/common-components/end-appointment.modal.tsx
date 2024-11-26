import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar, updateVisit, useVisit } from '@openmrs/esm-framework';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import { useMutateAppointments } from '../../form/appointments-form.resource';

interface EndAppointmentModalProps {
  patientUuid: string;
  appointmentUuid: string;
  closeModal: () => void;
}

const EndAppointmentModal: React.FC<EndAppointmentModalProps> = ({ patientUuid, appointmentUuid, closeModal }) => {
  const { t } = useTranslation();
  const { activeVisit, mutate } = useVisit(patientUuid);
  const { mutateAppointments } = useMutateAppointments();

  const handleEndAppointment = useCallback(() => {
    changeAppointmentStatus('Completed', appointmentUuid)
      .then(() => {
        mutateAppointments();
        if (activeVisit) {
          const abortController = new AbortController();
          const endVisitPayload = { stopDatetime: new Date() };

          return updateVisit(activeVisit.uuid, endVisitPayload, abortController)
            .then(() => {
              showSnackbar({
                title: t('appointmentEnded', 'Appointment ended'),
                subtitle: t(
                  'appointmentEndedAndVisitClosedSuccessfully',
                  'Appointment successfully ended and visit successfully closed',
                ),
                isLowContrast: true,
                kind: 'success',
              });
              mutate();
            })
            .catch((error) => {
              showSnackbar({
                title: t(
                  'appointmentEndedButVisitNotClosedError',
                  'Appointment ended successfully, but there was an error closing the visit.',
                ),
                subtitle: error?.message,
                kind: 'error',
                isLowContrast: true,
              });
            });
        } else {
          showSnackbar({
            title: t('appointmentEnded', 'Appointment ended'),
            subtitle: t('appointmentEndedSuccessfully', 'Appointment successfully ended.'),
            isLowContrast: true,
            kind: 'success',
          });
        }
      })
      .catch((error) => {
        showSnackbar({
          title: t('appointmentEndError', 'Error ending appointment'),
          subtitle: error?.message,
          kind: 'error',
          isLowContrast: true,
        });
      })
      .finally(() => {
        closeModal();
      });
  }, [activeVisit, appointmentUuid, closeModal, mutate, mutateAppointments, t]);

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        title={t('endAppointmentConfirmation', 'Are you sure you want to check the patient out for this appointment?')}
      />
      <ModalBody>
        <p>
          {activeVisit
            ? t(
                'endAppointmentAndVisitConfirmationMessage',
                'Checking the patient out will mark the appointment as complete and close out the active visit for this patient.',
              )
            : t('endAppointmentConfirmationMessage', 'Checking the patient out will mark the appointment as complete.')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleEndAppointment}>
          {t('checkOut', 'Check out')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default EndAppointmentModal;
