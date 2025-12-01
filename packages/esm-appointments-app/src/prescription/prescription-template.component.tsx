import React, { useMemo } from 'react';
import { formatDate, useConfig } from '@openmrs/esm-framework';
import { type Appointment } from '../types';
import { type ConfigObject } from '../config-schema';
import { usePatientPhoneNumber } from './usePatientPhoneNumber';
import { PrescriptionHeader } from './components/PrescriptionHeader';
import { PrescriptionPatientInfo } from './components/PrescriptionPatientInfo';
import { PrescriptionBody } from './components/PrescriptionBody';
import { PrescriptionFooter } from './components/PrescriptionFooter';
import styles from './prescription-template.scss';

interface PrescriptionTemplateProps {
  appointment: Appointment;
}

const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({ appointment }) => {
  const config = useConfig<ConfigObject>();
  const { prescriptionConfig } = config;

  // Fetch patient phone number
  const { phoneNumber } = usePatientPhoneNumber(appointment.patient?.uuid);

  // Parse doctor name and qualification
  const { doctorName, qualification } = useMemo(() => {
    const fullName = appointment.providers?.[0]?.name || 'Dr. Doctor Name';
    const parts = fullName.trim().split(' ');
    return {
      doctorName: parts.slice(0, -1).join(' ') || fullName,
      qualification: parts.length > 1 ? parts[parts.length - 1] : '',
    };
  }, [appointment.providers]);

  // Patient and appointment data
  const patientData = useMemo(
    () => ({
      patientName: appointment.patient?.name || '--',
      mrNumber: appointment.patient?.identifier || '--',
      contactNumber: phoneNumber || '',
      age: appointment.patient?.age || '--',
      date: formatDate(new Date(appointment.startDateTime), { noToday: true }),
      appointmentType: appointment.service?.name || '--',
    }),
    [appointment, phoneNumber],
  );

  return (
    <div className={styles.prescriptionPage}>
      <PrescriptionHeader doctorName={doctorName} qualification={qualification} logoUrl={prescriptionConfig.logoUrl} />

      <PrescriptionPatientInfo {...patientData} />

      <PrescriptionBody
        showDiagnosis={prescriptionConfig.showDiagnosisSection ?? true}
        watermarkLogoUrl={prescriptionConfig.watermarkLogoUrl}
        watermarkAlignment={prescriptionConfig.watermarkAlignment}
        watermarkOpacity={prescriptionConfig.watermarkOpacity}
      />

      <PrescriptionFooter
        hospitalName={appointment.location?.name}
        hospitalSlogan={prescriptionConfig.hospitalSlogan}
        address={prescriptionConfig.address}
        landlineNumber={prescriptionConfig.landlineNumber}
        whatsappNumber={prescriptionConfig.whatsappNumber}
        email={prescriptionConfig.email}
        website={prescriptionConfig.website}
      />
    </div>
  );
};

export default PrescriptionTemplate;
