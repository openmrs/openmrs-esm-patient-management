import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVisit, updateVisit, parseDate, showSnackbar } from '@openmrs/esm-framework';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import { useMutateAppointments } from '../../form/appointments-form.resource';

interface EndAppointmentModalProps {
  patientUuid: string;
  appointmentUuid: string;
  closeModal: () => void;
}

const EndAppointmentModal: React.FC<EndAppointmentModalProps> = ({ patientUuid, appointmentUuid, closeModal }) => {
  const { activeVisit, mutate } = useVisit(patientUuid);
  const { t } = useTranslation();
  const { mutateAppointments } = useMutateAppointments();

  const endAppointment = () => {
    return changeAppointmentStatus('Completed', appointmentUuid)
      .then(() => {
        mutateAppointments();
        if (activeVisit) {
          const abortController = new AbortController();
          const endVisitPayload = {
            location: activeVisit.location.uuid,
            startDatetime: parseDate(activeVisit.startDatetime),
            visitType: activeVisit.visitType.uuid,
            stopDatetime: new Date(),
          };
          updateVisit(activeVisit.uuid, endVisitPayload, abortController)
            .toPromise()
            .then(() => {
              mutate();
              showSnackbar({
                title: t('appointmentEnded', 'Appointment ended'),
                subtitle: t(
                  'appointmentEndedAndVisitClosedSuccessfully',
                  'Appointment successfully ended and visit successfully closed.',
                ),
                isLowContrast: true,
                kind: 'success',
              });
              closeModal();
            })
            .catch((err) => {
              closeModal();
              showSnackbar({
                title: t('appointmentEndedButVisitNotClosedError', 'Appointment ended, but error closing visit'),
                subtitle: err?.message,
                kind: 'error',
                isLowContrast: true,
              });
            });
        } else {
          closeModal();
          showSnackbar({
            title: t('appointmentEnded', 'Appointment ended'),
            subtitle: t('appointmentEndedSuccessfully', 'Appointment successfully ended.'),
            isLowContrast: true,
            kind: 'success',
          });
        }
      })
      .catch((err) => {
        closeModal();
        showSnackbar({
          title: t('appointmentEndError', 'Error ending appointment'),
          subtitle: err?.message,
          kind: 'error',
          isLowContrast: true,
        });
      });
  };

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
                'Checking the patient out will mark the appointment as complete, and close out the active visit for this patient.',
              )
            : t('endAppointmentConfirmationMessage', 'Checking the patient out will mark the appointment as complete.')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={endAppointment}>
          {t('checkOut', 'Check out')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default EndAppointmentModal;
