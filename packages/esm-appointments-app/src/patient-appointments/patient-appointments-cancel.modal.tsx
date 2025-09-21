import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { changeAppointmentStatus, usePatientAppointments } from './patient-appointments.resource';

interface CancelAppointmentModalProps {
  closeCancelModal: () => void;
  appointmentUuid: string;
  patientUuid: string;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  closeCancelModal,
  appointmentUuid,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const startDate = useMemo(() => dayjs().subtract(6, 'month').toISOString(), []);
  const { mutate } = usePatientAppointments(
    patientUuid,
    startDate,
    useMemo(() => new AbortController(), []),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelAppointment = async () => {
    setIsSubmitting(true);

    try {
      await changeAppointmentStatus('Cancelled', appointmentUuid);
      mutate();
      closeCancelModal();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('appointmentCancelledSuccessfully', 'Appointment cancelled successfully'),
        title: t('appointmentCancelled', 'Appointment cancelled'),
      });
    } catch (err) {
      const rawErrorMessage =
        err?.responseBody?.error?.message ||
        err?.responseBody?.message ||
        err?.message ||
        t('unknownError', 'An unknown error occurred');

      // Remove square brackets from the error message
      const errorMessage = rawErrorMessage.replace(/^\[|\]$/g, '');

      showSnackbar({
        title: t('appointmentCancelError', 'Error cancelling appointment'),
        kind: 'error',
        isLowContrast: false,
        subtitle: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ModalHeader closeModal={closeCancelModal} title={t('cancelAppointment', 'Cancel appointment')} />
      <ModalBody>
        <p>{t('cancelAppointmentModalConfirmationText', 'Are you sure you want to cancel this appointment?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeCancelModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button kind="danger" onClick={handleCancelAppointment} disabled={isSubmitting}>
          {t('cancelAppointment', 'Cancel appointment')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default CancelAppointmentModal;
