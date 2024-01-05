import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, TextArea } from '@carbon/react';
import { useSession, showSnackbar, ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { cancelAppointment } from '../forms.resource';
import { useSWRConfig } from 'swr';
import { useAppointmentDate } from '../../../helpers';
import { closeOverlay } from '../../../hooks/useOverlay';
import { type MappedAppointment } from '../../../types';
import styles from './cancel-appointment.scss';

interface CancelAppointmentProps {
  appointment: MappedAppointment;
}
const CancelAppointment: React.FC<CancelAppointmentProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { patient } = usePatient(appointment.patientUuid);
  const session = useSession();
  const [selectedLocation, setSelectedLocation] = useState(appointment.location);
  const [reason, setReason] = useState('');
  const { currentAppointmentDate } = useAppointmentDate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { status } = await cancelAppointment('Cancelled', appointment.id);
    if (status === 200) {
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('cancelledSuccessfully', 'It has been cancelled successfully'),
        title: t('appointmentCancelled', 'Appointment cancelled'),
      });
      mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${currentAppointmentDate}&status=Scheduled`);
      mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${currentAppointmentDate}&status=Cancelled`);
      closeOverlay();
    } else {
      showSnackbar({
        title: t('appointmentCancelError', 'Error cancelling appointment'),
        kind: 'error',
        subtitle: t('errorCancellingAppointment', 'Error cancelling the appointment'),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {patient && (
        <ExtensionSlot
          name="patient-header-slot"
          state={{
            patient,
            patientUuid: appointment.patientUuid,
          }}
        />
      )}

      <Layer>
        <TextArea
          id="reason"
          value={reason}
          className={styles.inputContainer}
          labelText={t('reasonForChanges', 'Reason For Changes')}
          onChange={(event) => setReason(event.target.value)}
        />
      </Layer>

      <div className={styles.buttonContainer}>
        <Button onClick={() => closeOverlay()} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} kind="primary" type="submit">
          {t('cancelAppointment', 'Cancel Appointment')}
        </Button>
      </div>
    </div>
  );
};

export default CancelAppointment;
