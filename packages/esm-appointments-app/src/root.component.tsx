import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppointmentsCalendarListView from './appointments-calendar/appointments-calendar-list-view.component';
import CalendarPatientList from './appointments-calendar/calendar-patient-list/calendar-patient-list.component';
import { spaBasePath, spaRoot } from './constants';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={`${window.spaBase}`}>
          <Routes>
            <Route path="/calendar" element={<AppointmentsCalendarListView />} />
            <Route path="/patient-list/:forDate/:serviceName" element={<CalendarPatientList />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
