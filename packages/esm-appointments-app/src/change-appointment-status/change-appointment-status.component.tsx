import React, { useState } from 'react';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  RadioButton,
  RadioButtonGroup,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './change-appointment-status.scss';
import { MappedAppointment } from '../types';
import { changeAppointmentStatus } from './appointment-status.resource';
import { navigate, showNotification, showToast } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';
import { startDate } from '../helpers';

interface ChangeAppointmentStatusModalProps {
  appointments: MappedAppointment;
  closeModal: () => void;
}

const ChangeAppointmentStatusModal: React.FC<ChangeAppointmentStatusModalProps> = ({ appointments, closeModal }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { name, id, dateTime, serviceType, status } = appointments;
  const [selectedStatus, setSelectedStatus] = useState(status);
  const appointmentStatus = [
    { display: t('checkedIn', 'CheckedIn'), value: 'CheckedIn' },
    { display: t('missed', 'Missed'), value: 'Missed' },
    { display: t('completed', 'Completed'), value: 'Completed' },
  ];

  const handleChangeAppointmentStatus = async () => {
    const ac = new AbortController();
    const { status, statusText } = await changeAppointmentStatus(selectedStatus, id, ac);
    status === 200
      ? showToast({
          critical: true,
          kind: 'success',
          description:
            t('appointmentStatusChange', 'Appointment status successfully changed to') + ` ${selectedStatus}`,
          title: t('appointmentStatusTitleMessage', 'Appointment status'),
        })
      : showNotification({
          title: t('appointmentFormError', 'Error updating appointment status'),
          kind: 'error',
          critical: true,
          description: statusText,
        });
    selectedStatus === 'CheckedIn' && navigate({ to: `\${openmrsSpaBase}/outpatient` });
    mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=Scheduled`);
    closeModal();
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('changeAppointmentStatus', 'Change appointment status')} />
      <ModalBody>
        <div className={styles.modalBody}>
          <h4>
            {t('patientName', 'Patient name')}&nbsp;
            {name}
          </h4>
          <h5>
            {t('serviceType', 'Service type')}&nbsp;
            {serviceType}
          </h5>
          <h6>
            {t('startTime', 'Start time')}&nbsp;
            {dateTime}
          </h6>
        </div>
        <Form onSubmit={() => {}}>
          <FormGroup legendText="">
            <RadioButtonGroup
              className={styles.radioButtonGroup}
              valueSelected={selectedStatus}
              orientation="vertical"
              onChange={(value) => setSelectedStatus(value)}
              name="radio-button-group">
              {appointmentStatus.map(({ value, display }) => (
                <RadioButton key={value} className={styles.radioButton} id={value} labelText={display} value={value} />
              ))}
            </RadioButtonGroup>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleChangeAppointmentStatus}>{t('exitAndChangeStatus', 'Change status')}</Button>
      </ModalFooter>
    </div>
  );
};

export default ChangeAppointmentStatusModal;
