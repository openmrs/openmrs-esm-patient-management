import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar/appointments-calendar-view.component';
import ClinicalAppointments from './appointments.component';
import CalendarPatientList from './appointments-calendar/patient-list/calendar-patient-list.component';

const swrConfiguration = {
  errorRetryCount: 3,
};

const RootComponent: React.FC = () => {
  const appointmentsBasename = window.getOpenmrsSpaBase() + 'home/appointments';

  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={appointmentsBasename}>
          <Routes>
            <Route path="/" element={<ClinicalAppointments />} />
            <Route path="/calendar" element={<AppointmentsCalendarView />} />
            <Route path="/list/:dateTime/:serviceName" element={<CalendarPatientList />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default RootComponent;
