import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import AppointmentsCalendarView from './calendar/appointments-calendar-view.component';
import Appointments from './appointments.component';
import PatientAppointmentsOverview from './patient-appointments/patient-appointments-overview.component';
import { WorkspaceContainer } from '@openmrs/esm-framework/src';

function PatientAppointmentWorkspaceContainer() {
  const { patientUuid } = useParams();
  return <WorkspaceContainer contextKey={patientUuid ?? 'default'} />;
}
function AppointmentWorkspaceContainer() {
  const { date, serviceType } = useParams();
  const contextKey = [date, serviceType].filter(Boolean).join(':') || 'default';
  return <WorkspaceContainer contextKey={contextKey} />;
}
function AppointmentCalendarWorkspaceContainer() {
  const { date } = useParams();
  return <WorkspaceContainer contextKey={date || 'default'} />;
}
const RootComponent: React.FC = () => {
  const appointmentsBasename = window.getOpenmrsSpaBase() + 'home/appointments';

  return (
    <main>
      <BrowserRouter basename={appointmentsBasename}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Appointments />
                <AppointmentWorkspaceContainer />
                <PatientAppointmentWorkspaceContainer />
              </>
            }
          />
          <Route
            path="/:date"
            element={
              <>
                <Appointments />
                <AppointmentWorkspaceContainer />
              </>
            }
          />
          <Route
            path="/:date/:serviceType"
            element={
              <>
                <Appointments />
                <AppointmentWorkspaceContainer />
              </>
            }
          />
          <Route
            path="/calendar"
            element={
              <>
                <AppointmentsCalendarView />
                <AppointmentCalendarWorkspaceContainer />
              </>
            }
          />
          <Route
            path="/calendar/:date"
            element={
              <>
                <AppointmentsCalendarView />
                <AppointmentCalendarWorkspaceContainer />
              </>
            }
          />
          <Route
            path="/patient/:patientUuid"
            element={
              <>
                <PatientAppointmentsOverview />
                <PatientAppointmentWorkspaceContainer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default RootComponent;
