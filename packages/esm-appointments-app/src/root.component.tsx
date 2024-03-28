import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsCalendarView from './calendar/appointments-calendar-view.component';
import Appointments from './appointments.component';
import PatientAppointmentsOverview from './patient-appointments/patient-appointments-overview.component';

const RootComponent: React.FC = () => {
  const appointmentsBasename = window.getOpenmrsSpaBase() + 'home/appointments';

  return (
    <main>
      <BrowserRouter basename={appointmentsBasename}>
        <Routes>
          <Route path="/" element={<Appointments />} />
          <Route path="/:date" element={<Appointments />} />
          <Route path="/:date/:serviceType" element={<Appointments />} />
          <Route path="/calendar" element={<AppointmentsCalendarView />} />
          <Route path="/calendar/:date" element={<AppointmentsCalendarView />} />
          <Route path="/patient/:patientUuid" element={<PatientAppointmentsOverview />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default RootComponent;
