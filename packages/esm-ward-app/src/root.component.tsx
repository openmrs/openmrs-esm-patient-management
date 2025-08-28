import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import WardView from './ward-view/ward-view.component';
import { WorkspaceContainer } from '@openmrs/esm-framework/src';
function WardWorkspaceContainer() {
  const { locationUuid } = useParams();
  return <WorkspaceContainer contextKey={locationUuid ?? 'default'} />;
}
const Root: React.FC = () => {
  // t('wards', 'Wards')
  const wardViewBasename = window.getOpenmrsSpaBase() + 'home/ward';

  return (
    <main>
      <BrowserRouter basename={wardViewBasename}>
        <Routes>
          <Route path="/" element={<WardView />} />
          <Route
            path="/:locationUuid"
            element={
              <>
                <WardView />
                <WardWorkspaceContainer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
