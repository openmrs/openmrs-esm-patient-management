import React from 'react';
import { usePatient } from '@openmrs/esm-framework';
import PatientAppointmentsBase from './patient-appointments-base.component';
import { useParams } from 'react-router-dom';
import Overlay from '../overlay.component';
import PatientAppointmentContext, { PatientAppointmentContextTypes } from '../hooks/patientAppointmentContext';
import PatientAppointmentsHeader from './patient-appointments-header';

const PatientAppointmentsOverview: React.FC = () => {
  let params = useParams();
  const response = usePatient(params.patientUuid);

  return response.isLoading ? (
    <></>
  ) : (
    <PatientAppointmentContext.Provider value={PatientAppointmentContextTypes.APPOINTMENTS_APP}>
      <PatientAppointmentsHeader patient={response.patient} />
      <PatientAppointmentsBase patientUuid={response.patient.id} />
      <Overlay />
    </PatientAppointmentContext.Provider>
  );
};

export default PatientAppointmentsOverview;
