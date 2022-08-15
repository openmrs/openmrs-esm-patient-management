import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { spaBasePath } from './constants';
import AppointmentsDashboard from './dashboard/appointments-dashboard.component';
import Overlay from './overlay.component';

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
          </Routes>
          <Overlay />
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
