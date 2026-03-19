import React from 'react';
import { Modal } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './appointment-summary-modal.scss';

interface ServiceCount {
  serviceName: string;
  serviceUuid: string;
  count: number;
}

interface AppointmentSummaryModalProps {
  open: boolean;
  heading: string;
  services: Array<ServiceCount> | undefined;
  onClose: () => void;
}

const AppointmentSummaryModal: React.FC<AppointmentSummaryModalProps> = ({ open, heading, services, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal open={open} modalHeading={heading} passiveModal onRequestClose={onClose}>
      {services?.length ? (
        <table className={styles.modalTable}>
          <thead>
            <tr>
              <th>{t('service', 'Service')}</th>
              <th>{t('count', 'Count')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(({ serviceName, serviceUuid, count }) => (
              <tr key={serviceUuid}>
                <td>{serviceName}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{t('noAppointmentsForDay', 'No appointments scheduled for this day.')}</p>
      )}
    </Modal>
  );
};

export default AppointmentSummaryModal;
