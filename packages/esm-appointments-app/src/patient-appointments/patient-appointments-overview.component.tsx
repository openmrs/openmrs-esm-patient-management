import React from 'react';
import { usePatient, useLayoutType, isDesktop } from '@openmrs/esm-framework';
import PatientAppointmentsBase from './patient-appointments-base.component';
import { useParams } from 'react-router-dom';
import Overlay from '../overlay.component';
import PatientAppointmentContext, { PatientAppointmentContextTypes } from '../hooks/patientAppointmentContext';
import PatientAppointmentsHeader from './patient-appointments-header';
import { DataTableSkeleton } from '@carbon/react';

const PatientAppointmentsOverview: React.FC = () => {
  let params = useParams();
  const response = usePatient(params.patientUuid);
  const layout = useLayoutType();

  return response.isLoading ? (
    <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />
  ) : (
    <PatientAppointmentContext.Provider value={PatientAppointmentContextTypes.APPOINTMENTS_APP}>
      <PatientAppointmentsHeader patient={response.patient} />
      <PatientAppointmentsBase patientUuid={response.patient.id} />
      <Overlay />
    </PatientAppointmentContext.Provider>
  );
};

export default PatientAppointmentsOverview;
