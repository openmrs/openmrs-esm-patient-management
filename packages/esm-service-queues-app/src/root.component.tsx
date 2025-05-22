import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import AppointmentsTable from './queue-patient-linelists/scheduled-appointments-table.component';
import Home from './home.component';
import ServicesTable from './queue-patient-linelists/queue-services-table.component';
import QueueScreen from './queue-screen/queue-screen.component';
import QueueTableByStatusView from './views/queue-table-by-status-view.component';

const Root: React.FC = () => {
  const serviceQueuesBasename = window.getOpenmrsSpaBase() + 'home/service-queues';

  return (
    <main>
      <BrowserRouter basename={serviceQueuesBasename}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/queue-table-by-status/:queueUuid" element={<QueueTableByStatusViewWrapper />} />
          <Route path="/screen" element={<QueueScreen />} />
          <Route path="/appointments-list/:value/" element={<AppointmentsTable />} />
          <Route path="/queue-list/:service/:serviceUuid/:locationUuid" element={<ServicesTable />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

function QueueTableByStatusViewWrapper() {
  const { queueUuid } = useParams();
  return <QueueTableByStatusView queueUuid={queueUuid} />;
}

export default Root;
