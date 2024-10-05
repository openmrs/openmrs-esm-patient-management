import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Root: React.FC = () => {
  // t('wards', 'Wards')
  const wardViewBasename = window.getOpenmrsSpaBase() + 'home/ward';
  const { wardViewSlotName } = useConfig();

  const wardView = <ExtensionSlot name={wardViewSlotName ?? 'default-ward-view-slot'} />;

  return (
    <main>
      <BrowserRouter basename={wardViewBasename}>
        <Routes>
          <Route path="/" element={wardView} />
          <Route path="/:locationUuid" element={wardView} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
