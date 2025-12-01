import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { ModalBody, ModalHeader, ModalFooter, Button } from '@carbon/react';
import { type Appointment } from '../types';
import PrescriptionTemplate from './prescription-template.component';
import styles from './print-prescription-preview.scss';

type PrintPrescriptionPreviewModalProps = {
  onClose: () => void;
  appointment: Appointment;
};

const PrintPrescriptionPreviewModal: React.FC<PrintPrescriptionPreviewModalProps> = ({ onClose, appointment }) => {
  const { t } = useTranslation();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Prescription_${appointment.patient?.name}_${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_')}`,
  });

  return (
    <div>
      <ModalHeader closeModal={onClose} className={styles.title}>
        {t('prescriptionPreview', 'Prescription Preview - {{patientName}}', { patientName: appointment.patient?.name })}
      </ModalHeader>
      <ModalBody>
        <div className={styles.previewContainer}>
          <div ref={componentRef}>
            <PrescriptionTemplate appointment={appointment} />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose} type="button">
          {t('close', 'Close')}
        </Button>
        <Button kind="primary" onClick={handlePrint} type="button">
          {t('print', 'Print')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default PrintPrescriptionPreviewModal;
