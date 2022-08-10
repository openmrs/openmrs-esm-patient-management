import React, { useState, useEffect } from 'react';
import { TextArea, Button, ButtonSet } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './appointment-form.scss';
import { useSession, showToast, showNotification, ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { AppointmentPayload, MappedAppointment } from '../types';
import { saveAppointment, useServices } from '../appoinments-tabs/appointments-table.resource';

interface CancelAppointmentProps {
  appointment: MappedAppointment;
}
const CancelAppointment: React.FC<CancelAppointmentProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { patient } = usePatient(appointment.patientUuid);
  const session = useSession();
  const [selectedLocation, setSelectedLocation] = useState(appointment.location);
  const [selectedService, setSelectedService] = useState(appointment.serviceType);
  const [selectedProvider, setSelectedProvider] = useState(session?.currentProvider?.uuid);
  const [reason, setReason] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  const [appointmentKind, setAppointmentKind] = useState(appointment.serviceType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = () => {
    const endDatetime = dayjs(visitDate).format('YYYY-MM-DD');
    const appointmentPayload: AppointmentPayload = {
      appointmentKind: appointmentKind,
      serviceUuid: selectedService,
      startDateTime: dayjs(endDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      providerUuid: selectedProvider,
      comments: reason,
      locationUuid: selectedLocation,
      patientUuid: appointment.patientUuid,
      status: 'Cancelled',
      appointmentNumber: appointment.appointmentNumber,
      uuid: appointment.id,
    };
    const abortController = new AbortController();
    saveAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It has been cancelled successfully'),
            title: t('appointmentCancelled', 'Appointment Cancelled'),
          });
        }
      },
      (error) => {
        showNotification({
          title: t('appointmentCancelError', 'Error cancelling appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };
  return (
    <div className={styles.formContainer}>
      <ExtensionSlot
        extensionSlotName="patient-header-slot"
        state={{
          patient,
          patientUuid: appointment.patientUuid,
        }}
      />

      <TextArea
        id="reason"
        light
        value={reason}
        className={styles.inputContainer}
        labelText={t('reasonForCancelling', 'Reason For Cancelling')}
        onChange={(event) => setReason(event.target.value)}
      />

      <ButtonSet>
        <Button className={styles.button} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('cancelAppointment', 'Cancel Appointment')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default CancelAppointment;
