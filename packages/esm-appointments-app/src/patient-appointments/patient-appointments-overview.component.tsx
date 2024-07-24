import React from 'react';
import { usePatient, useLayoutType, isDesktop, WorkspaceContainer } from '@openmrs/esm-framework';
import PatientAppointmentsBase from './patient-appointments-base.component';
import { useParams } from 'react-router-dom';
import PatientAppointmentContext, { PatientAppointmentContextTypes } from '../hooks/patientAppointmentContext';
import PatientAppointmentsHeader from './patient-appointments-header';
import { DataTableSkeleton } from '@carbon/react';
import styles from './patient-appointments-overview.scss';

/**
 * This component renders the patient appointments view (all appointments for a single patient) outside of the context of the patient chart.
 * Currently, it is not linked directly within the Appointments app, but can be accessed via the home/appointments/patient/:patientUuid route,
 * providing a means for other apps (or legacy O2 UIs) to link to the patient appointments overview.
 * It uses the PatientAppointmentsBase component to render the actual appointments data.
 * @constructor
 */
const PatientAppointmentsOverview: React.FC = () => {
  let params = useParams();
  const response = usePatient(params.patientUuid);
  const layout = useLayoutType();

  return response.isLoading ? (
    <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />
  ) : (
    <PatientAppointmentContext.Provider value={PatientAppointmentContextTypes.APPOINTMENTS_APP}>
      <div className={styles.patientAppointmentsOverview}>
        <PatientAppointmentsHeader patient={response.patient} />
        <PatientAppointmentsBase patientUuid={response.patient.id} />
        <WorkspaceContainer overlay contextKey={`patient/${params.patientUuid}`} />
      </div>
    </PatientAppointmentContext.Provider>
  );
};

export default PatientAppointmentsOverview;
