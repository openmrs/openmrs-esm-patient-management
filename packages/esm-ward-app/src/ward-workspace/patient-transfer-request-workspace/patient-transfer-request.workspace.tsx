import React from 'react';
import PatientTransferForm from '../patient-transfer-bed-swap/patient-transfer-request-form.component';
import { type WardPatientWorkspaceProps } from '../../types';

interface PatientTransferRequestFormProps extends WardPatientWorkspaceProps {}

const PatientTransferRequestForm: React.FC<PatientTransferRequestFormProps> = (props) => {
  return <PatientTransferForm {...props} />;
};

export default PatientTransferRequestForm;
