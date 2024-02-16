import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsCalendarView from './calendar/appointments-calendar-view.component';
import Appointments from './appointments.component';
import CalendarPatientList from './calendar/patient-list/calendar-patient-list.component';

const RootComponent: React.FC = () => {
  const appointmentsBasename = window.getOpenmrsSpaBase() + 'home/appointments';

  return (
    <main>
      <BrowserRouter basename={appointmentsBasename}>
        <Routes>
          <Route path="/" element={<Appointments />} />
          <Route path="/calendar" element={<AppointmentsCalendarView />} />
          <Route path="/list/:dateTime/:serviceName" element={<CalendarPatientList />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default RootComponent;
