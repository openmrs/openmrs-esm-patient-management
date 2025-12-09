import React from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { usePatient, useLayoutType, isDesktop, WorkspaceContainer, launchWorkspace2 } from '@openmrs/esm-framework';
import PatientAppointmentsDetailedSummary from './patient-appointments-detailed-summary.extension';
import PatientAppointmentsHeader from './patient-appointments-header.component';
import styles from './patient-appointments-overview.scss';

/**
 * This component renders the patient appointments view (all appointments for a single patient) outside of the context of the patient chart.
 * Currently, it is not linked directly within the Appointments app, but can be accessed via the home/appointments/patient/:patientUuid route,
 * providing a means for other apps (or legacy O2 UIs) to link to the patient appointments overview.
 * It uses the PatientAppointmentsBase component to render the actual appointments data.
 * @constructor
 */
const PatientAppointmentsOverview: React.FC = () => {
  const params = useParams();
  const response = usePatient(params.patientUuid);
  const layout = useLayoutType();

  return response.isLoading ? (
    <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />
  ) : (
    <div className={styles.patientAppointmentsOverview}>
      <PatientAppointmentsHeader patient={response.patient} />
      <PatientAppointmentsDetailedSummary
        patientUuid={response.patient.id}
        launchAppointmentForm={(patientUuid, appointment) => {
          launchWorkspace2('appointments-form-workspace', { patientUuid, appointment });
        }}
      />
      <WorkspaceContainer overlay contextKey={`patient/${params.patientUuid}`} />
    </div>
  );
};

export default PatientAppointmentsOverview;
