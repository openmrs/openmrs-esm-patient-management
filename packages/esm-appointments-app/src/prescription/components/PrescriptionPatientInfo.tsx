import React from 'react';
import styles from '../prescription-template.scss';

interface PatientInfoProps {
  patientName: string;
  mrNumber: string;
  contactNumber: string;
  age: string;
  date: string;
  appointmentType: string;
}

interface FormFieldProps {
  label: string;
  value: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, value }) => (
  <div className={styles.formColumn}>
    <span className={styles.label}>{label}:</span>
    <span className={styles.underline}>{value}</span>
  </div>
);

export const PrescriptionPatientInfo: React.FC<PatientInfoProps> = ({
  patientName,
  mrNumber,
  contactNumber,
  age,
  date,
  appointmentType,
}) => {
  return (
    <div className={styles.patientSection}>
      <div className={styles.formRowTriple}>
        <FormField label="Patient Name" value={patientName} />
        <FormField label="MR Number" value={mrNumber} />
        <FormField label="Contact" value={contactNumber} />
      </div>
      <div className={styles.formRowTriple}>
        <FormField label="Age" value={age} />
        <FormField label="Date" value={date} />
        <FormField label="Type" value={appointmentType} />
      </div>
    </div>
  );
};
