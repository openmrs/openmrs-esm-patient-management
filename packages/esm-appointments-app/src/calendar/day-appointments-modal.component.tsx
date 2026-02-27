import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposedModal, ModalBody, ModalHeader } from '@carbon/react';
import { useAppointmentList } from '../hooks/useAppointmentList';
import { filterByServiceType } from '../appointments/utils';
import AppointmentsTable from '../appointments/common-components/appointments-table.component';
import { formatDate } from '@openmrs/esm-framework';

interface DayAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  serviceUuid: string | null;
}

const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({ isOpen, onClose, date, serviceUuid }) => {
  const { t } = useTranslation();
  const { appointmentList, isLoading } = useAppointmentList('Scheduled', date ?? undefined);

  const serviceFilter = useMemo(() => (serviceUuid ? [serviceUuid] : []), [serviceUuid]);
  const appointments = useMemo(
    () =>
      filterByServiceType(appointmentList, serviceFilter).map((appointment) => ({
        id: appointment.uuid,
        ...appointment,
      })),
    [appointmentList, serviceFilter],
  );

  const title = date
    ? t('appointmentsOnDate', 'Appointments on {{date}}', {
        date: formatDate(new Date(date), { day: true, month: true, year: true, time: false }),
      })
    : t('appointments', 'Appointments');

  return (
    <ComposedModal open={isOpen} onClose={onClose} size="lg" preventCloseOnClickOutside={false}>
      <ModalHeader title={title} closeModal={onClose} />
      <ModalBody>
        {date ? (
          <AppointmentsTable
            appointments={appointments}
            isLoading={isLoading}
            tableHeading={title}
            hasActiveFilters={serviceUuid != null}
            allowSelectionAndEditForAll
          />
        ) : null}
      </ModalBody>
    </ComposedModal>
  );
};

export default DayAppointmentsModal;
