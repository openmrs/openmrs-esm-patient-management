import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar/appointments-calendar-view.component';
import ClinicalAppointments from './appointments.component';

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
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default RootComponent;
