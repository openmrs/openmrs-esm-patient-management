import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route } from 'react-router-dom';
import { spaBasePath } from './constants';
import { AppointmentsDashboard } from './dashboard/appointments-dashboard.component';

const swrConfiguration = {
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={spaBasePath}>
          <Route path="/:view?" component={AppointmentsDashboard} />
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
