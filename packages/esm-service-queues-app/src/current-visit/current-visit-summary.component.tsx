import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, DataTableSkeleton } from '@carbon/react';
import { attach, ExtensionSlot, getGlobalStore, launchWorkspace2, usePatient } from '@openmrs/esm-framework';
import { serviceQueuesPatientVitalsWorkspace, serviceQueuesVisitNotesWorkspace } from '../constants';
import { useVisit } from './current-visit.resource';
import styles from './current-visit.scss';

const vitalsInfoSlot = 'service-queues-current-visit-vitals-slot';
attach(vitalsInfoSlot, 'patient-vitals-info');

const visitSummarySlot = 'service-queues-visit-summary-slot';
attach(visitSummarySlot, 'visit-summary');

// External workspaces that don't share the useVisit SWR key, so we revalidate the visit when
// they close rather than relying on the form to mutate it.
const VISIT_REFRESHING_WORKSPACES = new Set([serviceQueuesVisitNotesWorkspace, serviceQueuesPatientVitalsWorkspace]);

interface WorkspaceStoreState {
  openedWindows: Array<{ openedWorkspaces: Array<{ workspaceName: string }> }>;
}

interface CurrentVisitProps {
  patientUuid: string;
  visitUuid?: string;
}

const CurrentVisit: React.FC<CurrentVisitProps> = ({ patientUuid, visitUuid }) => {
  const { t } = useTranslation();
  const { visit, isLoading, mutate } = useVisit(visitUuid);
  const { patient } = usePatient(patientUuid);

  const openRefreshingWorkspacesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const store = getGlobalStore<WorkspaceStoreState>('workspace2');
    const getOpenRefreshing = (state: WorkspaceStoreState) => {
      const open = new Set<string>();
      state?.openedWindows?.forEach((window) =>
        window.openedWorkspaces?.forEach(({ workspaceName }) => {
          if (VISIT_REFRESHING_WORKSPACES.has(workspaceName)) {
            open.add(workspaceName);
          }
        }),
      );
      return open;
    };
    openRefreshingWorkspacesRef.current = getOpenRefreshing(store.getState());
    return store.subscribe((state) => {
      const nowOpen = getOpenRefreshing(state);
      const didClose = [...openRefreshingWorkspacesRef.current].some((name) => !nowOpen.has(name));
      openRefreshingWorkspacesRef.current = nowOpen;
      if (didClose) {
        mutate();
      }
    });
  }, [mutate]);

  if (!visitUuid) {
    return <p className={styles.bodyLong01}>{t('noActiveVisit', 'No active visit')}</p>;
  }

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (!visit) {
    return <p className={styles.bodyLong01}>{t('noActiveVisit', 'No active visit')}</p>;
  }

  const vitalsSlotState = {
    patientUuid,
    patient,
    visitContext: visit,
    launchCustomVitalsForm: () =>
      launchWorkspace2(serviceQueuesPatientVitalsWorkspace, { patientUuid, patient, visitContext: visit }),
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headingContainer}>
        <p className={styles.heading}>{visit.visitType?.display}</p>
        <div className={styles.subHeading}>
          {t('scheduledToday', 'Scheduled for today')}{' '}
          <Tag size="sm" type="blue">
            {t('onTime', 'On time')}
          </Tag>
        </div>
      </div>
      <div className={styles.visitContainer}>
        <ExtensionSlot name={vitalsInfoSlot} state={vitalsSlotState} />
        <ExtensionSlot name={visitSummarySlot} state={{ visit, patientUuid }} />
      </div>
    </div>
  );
};

export default CurrentVisit;
