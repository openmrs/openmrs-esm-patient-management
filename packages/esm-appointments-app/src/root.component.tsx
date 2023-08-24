import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar/appointments-calendar-view.component';
import ClinicalAppointments from './appointments.component';

const swrConfiguration = {
  errorRetryCount: 3,
};

const RootComponent: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={window.getOpenmrsSpaBase()}>
          <Routes>
            <Route path="home/appointments" element={<ClinicalAppointments />} />
            <Route path="home/appointments/calendar" element={<AppointmentsCalendarView />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default RootComponent;
