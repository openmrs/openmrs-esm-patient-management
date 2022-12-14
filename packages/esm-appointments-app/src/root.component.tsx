import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { spaBasePath } from './constants';
import AppointmentsDashboard from './dashboard/appointments-dashboard.component';
import Overlay from './overlay.component';
import AppointmentCalendar from './appointments-calendar/appointment-calendar.component';
import MissedAppointmentList from './appointments/missed-appointment-list.component';

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
            <Route path="/calendar" element={<AppointmentCalendar />} />
            <Route path="/missed" element={<MissedAppointmentList />} />
          </Routes>
          <Overlay />
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
