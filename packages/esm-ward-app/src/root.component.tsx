import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WardView from './ward-view/ward-view.component';
import { WorkspaceOverlay } from '@openmrs/esm-framework';

const Root: React.FC = () => {
  const wardViewBasename = window.getOpenmrsSpaBase() + 'ward';

  return (
    <main>
      <BrowserRouter basename={wardViewBasename}>
        <Routes>
          <Route path="/" element={<WardView />} />
          <Route path="/:locationUuid" element={<WardView />} />
        </Routes>
      </BrowserRouter>
      <WorkspaceOverlay contextKey="ward" />
    </main>
  );
};

export default Root;
