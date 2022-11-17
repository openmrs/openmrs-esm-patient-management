import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { spaBasePath, spaRoot } from './constants';
import AppointmentsDashboard from './dashboard/appointments-dashboard.component';
import Overlay from './overlay.component';
import AppointmentsCalendarListView from './appointments-calendar/appointments-calendar-list-view.component';
import MissedAppointmentList from './appointments/missed-appointment-list.component';
import CalendarView from './calendar/components/Calendar/calendar-list-view';

const swrConfiguration = {
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={spaBasePath}>
          <Routes>
            <Route path="" element={<AppointmentsDashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/missed" element={<MissedAppointmentList />} />
          </Routes>
          <Overlay />
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
