import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { spaBasePath } from './constants';
import OutpatientDashboard from './dashboard/outpatient-dashboard.component';
import AppointmentsTable from './queue-patient-linelists/scheduled-appointments-table.component';
import ServicesTable from './queue-patient-linelists/queue-services-table.component';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={spaBasePath}>
          <Routes>
            <Route path="" element={<OutpatientDashboard />} />
            <Route path="/:view" element={<OutpatientDashboard />} />
            <Route path="/appointments-list/:value/" element={<AppointmentsTable />} />
            <Route path="/queue-list/:value/" element={<ServicesTable />} />
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
