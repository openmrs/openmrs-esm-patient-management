import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { WorkspaceContainer } from '@openmrs/esm-framework/src';
import Home from './home.component';
import ServicesTable from './queue-patient-linelists/queue-services-table.component';
import QueueScreen from './queue-screen/queue-screen.component';
import QueueTableByStatusView from './views/queue-table-by-status-view.component';
import AdminPage from './admin/admin-page/admin-page.component';

function ServiceQueuesWorkspaceContainer() {
  const { queueUuid } = useParams();
  return <WorkspaceContainer contextKey={queueUuid ?? 'default'} />;
}

function QueueListWorkspaceContainer() {
  const { service, serviceUuid, locationUuid } = useParams();
  const contextKey = [service, serviceUuid, locationUuid].filter(Boolean).join(':') || 'default';
  return <WorkspaceContainer contextKey={contextKey} />;
}
const Root: React.FC = () => {
  const serviceQueuesBasename = window.getOpenmrsSpaBase() + 'home/service-queues';

  return (
    <main>
      <BrowserRouter basename={serviceQueuesBasename}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/queue-list/:service/:serviceUuid/:locationUuid"
            element={
              <>
                <ServicesTable />
                <QueueListWorkspaceContainer />
              </>
            }
          />
          <Route
            path="/queue-table-by-status/:queueUuid"
            element={
              <>
                <QueueTableByStatusViewWrapper />
                <ServiceQueuesWorkspaceContainer />
              </>
            }
          />
          <Route path="/screen" element={<QueueScreen />} />
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
