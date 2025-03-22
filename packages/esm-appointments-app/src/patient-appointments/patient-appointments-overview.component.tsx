import React from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { usePatient, useLayoutType, isDesktop, WorkspaceContainer } from '@openmrs/esm-framework';
import {
  PatientAppointmentContextProvider,
  PatientAppointmentContextTypes,
} from '../hooks/patient-appointment-context';
import PatientAppointmentsBase from './patient-appointments-base.component';
import PatientAppointmentsHeader from './patient-appointments-header';
import styles from './patient-appointments-overview.scss';

/**
 * This component renders the patient appointments view (all appointments for a single patient) outside of the context of the patient chart.
 * Currently, it is not linked directly within the Appointments app, but can be accessed via the home/appointments/patient/:patientUuid route,
 * providing a means for other apps (or legacy O2 UIs) to link to the patient appointments overview.
 * It uses the PatientAppointmentsBase component to render the actual appointments data.
 * @constructor
 */
const PatientAppointmentsOverview: React.FC = () => {
  const { patientUuid } = useParams() as { patientUuid: string };
  const response = usePatient(patientUuid);
  const layout = useLayoutType();

  if (response.isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />;
  }

  return (
    <PatientAppointmentContextProvider value={PatientAppointmentContextTypes.APPOINTMENTS_APP}>
      <div className={styles.patientAppointmentsOverview}>
        <PatientAppointmentsHeader patient={response.patient} />
        <PatientAppointmentsBase patientUuid={response.patient.id} />
        <WorkspaceContainer overlay contextKey={`patient/${patientUuid}`} />
      </div>
    </PatientAppointmentContextProvider>
  );
};

export default PatientAppointmentsOverview;
