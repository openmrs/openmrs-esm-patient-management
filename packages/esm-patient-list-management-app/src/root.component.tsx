import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WorkspaceContainer, launchWorkspace } from '@openmrs/esm-framework';
import ListDetails from './list-details/list-details.component';
import ListsDashboard from './lists-dashboard/lists-dashboard.component';

const AutoLaunchPatientListWorkspace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    const shouldOpenCreate = searchParams.has('create') || searchParams.has('new_cohort');
    if (shouldOpenCreate && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      const rafId = requestAnimationFrame(() => {
        launchWorkspace('patient-list-form-workspace', {
          workspaceTitle: t('newPatientListHeader', 'New patient list'),
        });
        setSearchParams({}, { replace: true });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [searchParams, setSearchParams, t]);

  return null;
};

const RootComponent: React.FC = () => {
  const patientListsBasename = window.getOpenmrsSpaBase() + 'home/patient-lists';

  return (
    <BrowserRouter basename={patientListsBasename}>
      <AutoLaunchPatientListWorkspace />
      <Routes>
        <Route path="/" element={<ListsDashboard />} />
        <Route path="/:patientListUuid" element={<ListDetails />} />
      </Routes>
      <WorkspaceContainer contextKey="patient-lists" />
    </BrowserRouter>
  );
};

export default RootComponent;
