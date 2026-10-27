import React, { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, DefinitionTooltip, Tag } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import {
  attach,
  ExtensionSlot,
  formatDate,
  formatTime,
  getGlobalStore,
  launchWorkspace2,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import { type AppointmentStatus, type ConfigObject } from '../config-schema';
import { serviceQueuesPatientVitalsWorkspace, serviceQueuesVisitNotesWorkspace } from '../constants';
import { getEditEncounterHandler } from '../edit-encounter';
import { type TodaysAppointment, useTodaysAppointments, useVisit } from './current-visit.resource';
import styles from './current-visit.scss';

const vitalsInfoSlot = 'service-queues-current-visit-vitals-slot';
attach(vitalsInfoSlot, 'patient-vitals-info');

const visitSummarySlot = 'service-queues-visit-summary-slot';
attach(visitSummarySlot, 'visit-summary');

// External workspaces that don't share the useVisit SWR key, so we revalidate the visit when
// they close rather than relying on the form to mutate it.
const VISIT_REFRESHING_WORKSPACES = new Set([serviceQueuesVisitNotesWorkspace, serviceQueuesPatientVitalsWorkspace]);

// Formats values the same way as `getAttributeValue` in openmrs-esm-patient-chart
// (`patient-banner-tags/visit-attribute-tags.extension.tsx`), except that object values
// (e.g. a location or provider) show their display name instead of crashing the render.
const getAttributeValue = (attributeType, value) => {
  switch (attributeType?.datatypeClassname) {
    case 'org.openmrs.customdatatype.datatype.ConceptDatatype':
      return value?.display;
    case 'org.openmrs.customdatatype.datatype.DateDatatype':
      // The saved value is midnight in the server's offset, so read only the date part
      // as local midnight. Otherwise a browser behind the server shows the previous day.
      return formatDate(dayjs(String(value).split('T')[0]).toDate(), { mode: 'wide', time: false });
    default:
      return typeof value === 'object' && value !== null ? value.display : value;
  }
};

const AppointmentSummary: React.FC<{ appointment: TodaysAppointment }> = ({ appointment }) => {
  const { t } = useTranslation();

  const statusLabels: Record<AppointmentStatus, string> = {
    Requested: t('appointmentRequested', 'Requested'),
    WaitList: t('appointmentWaitList', 'Wait list'),
    Scheduled: t('appointmentScheduled', 'Scheduled'),
    Arrived: t('appointmentArrived', 'Arrived'),
    CheckedIn: t('appointmentCheckedIn', 'Checked in'),
    Completed: t('appointmentCompleted', 'Completed'),
    Cancelled: t('appointmentCancelled', 'Cancelled'),
    Missed: t('appointmentMissed', 'Missed'),
  };

  // Providers removed from an appointment stay on it with a CANCELLED response. The backend
  // returns providers in no fixed order, so sort them to always show the same one first.
  const providerNames = appointment.providers
    .filter(({ response, name }) => response !== 'CANCELLED' && name)
    .map(({ name }) => name)
    .sort((a, b) => a.localeCompare(b));
  const otherProviderCount = providerNames.length - 1;
  const summaryValues = {
    status: statusLabels[appointment.status] ?? appointment.status,
    service: appointment.service.name,
    time: formatTime(new Date(appointment.startDateTime)),
  };

  return (
    <span>
      {providerNames.length > 0
        ? t('appointmentSummaryWithProvider', '{{status}} · {{service}} at {{time}} with {{provider}}', {
            ...summaryValues,
            provider: providerNames[0],
          })
        : t('appointmentSummary', '{{status}} · {{service}} at {{time}}', summaryValues)}
      {otherProviderCount > 0 && (
        <>
          {' '}
          <DefinitionTooltip definition={providerNames.slice(1).join(', ')} openOnHover>
            {t('moreProviders', '+{{count}} providers', {
              count: otherProviderCount,
              defaultValue_one: '+{{count}} provider',
            })}
          </DefinitionTooltip>
        </>
      )}
    </span>
  );
};

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
  const { appointmentStatuses, visitAttributeTypes } = useConfig<ConfigObject>();
  const {
    appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    hasAppointmentsToday,
  } = useTodaysAppointments(patientUuid, appointmentStatuses);

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

  const attributeTags = visit.attributes
    ?.filter((attribute) => visitAttributeTypes?.some(({ uuid }) => attribute?.attributeType?.uuid === uuid))
    .map((attribute) => ({
      attribute,
      value: getAttributeValue(attribute?.attributeType, attribute?.value),
    }))
    .filter(({ value }) => value != null && value !== '');

  // An empty `appointmentStatuses` turns this section off. When the patient's only appointments today have
  // statuses that are not shown, show nothing rather than say that there are no appointments.
  const showAppointments =
    appointmentStatuses.length > 0 &&
    !isLoadingAppointments &&
    !appointmentsError &&
    (appointments.length > 0 || !hasAppointmentsToday);

  const vitalsSlotState = {
    patientUuid,
    patient,
    visitContext: visit,
    launchCustomVitalsForm: () =>
      launchWorkspace2(serviceQueuesPatientVitalsWorkspace, { patientUuid, patient, visitContext: visit }),
  };

  return (
    <>
      <div className={styles.headingContainer}>
        <div className={styles.headingRow}>
          <p className={styles.heading}>{visit.visitType?.display}</p>
          {attributeTags?.map(({ attribute, value }) => (
            <Tag key={attribute.uuid} size="sm" type="blue">
              {value}
            </Tag>
          ))}
        </div>
        <Button
          size="sm"
          kind="ghost"
          disabled={!patient}
          renderIcon={ArrowRight}
          onClick={() =>
            launchWorkspace2(serviceQueuesVisitNotesWorkspace, {
              formContext: 'creating',
              patientUuid,
              patient,
              visitContext: visit,
            })
          }>
          {t('visitNoteForm', 'Visit note form')}
        </Button>
      </div>
      {showAppointments && (
        <div className={styles.appointments}>
          {appointments.length ? (
            <>
              <p className={styles.heading}>{t('todaysAppointments', "Today's appointments")}</p>
              {appointments.map((appointment) => (
                <div key={appointment.uuid} className={styles.subHeading}>
                  <AppointmentSummary appointment={appointment} />
                </div>
              ))}
            </>
          ) : (
            <div className={styles.subHeading}>
              {t('noAppointmentsScheduledToday', 'No appointments scheduled for today')}
            </div>
          )}
        </div>
      )}
      <div className={styles.visitContainer}>
        {/* The vitals extension reads `patient` during render, before its own loading fallback. */}
        {patient && <ExtensionSlot name={vitalsInfoSlot} state={vitalsSlotState} />}
        <ExtensionSlot
          name={visitSummarySlot}
          state={{
            visit,
            patientUuid,
            patient,
            onEditEncounter: getEditEncounterHandler({ patient, patientUuid, visit, mutateVisit: mutate }),
            // Deleting an encounter opens a modal rather than a workspace, so the workspace subscription
            // above never fires for it and the extension has to revalidate us directly.
            mutateVisitContext: mutate,
          }}
        />
      </div>
    </>
  );
};

export default CurrentVisit;
