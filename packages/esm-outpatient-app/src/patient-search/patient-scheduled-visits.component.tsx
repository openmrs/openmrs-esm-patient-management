import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Switch,
  ContentSwitcher,
  RadioTile,
  TileGroup,
  DataTableSkeleton,
  InlineLoading,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import {
  formatDatetime,
  useLayoutType,
  parseDate,
  ErrorState,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
  useSession,
  useLocations,
  NewVisitPayload,
  saveVisit,
  useVisitTypes,
  useVisit,
  useConfig,
  ConfigObject,
} from '@openmrs/esm-framework';
import { QueueEntryPayload, SearchTypes } from '../types';
import styles from './patient-scheduled-visits.scss';
import { useScheduledVisits } from './hooks/useScheduledVisits';
import isNil from 'lodash-es/isNil';
import { usePriority, useServices, useStatus } from '../active-visits/active-visits-table.resource';
import { useSWRConfig } from 'swr';
import { saveQueueEntry } from './visit-form/queue.resource';
import { first } from 'rxjs/operators';
import { convertTime12to24, amPm } from '../helpers/time-helpers';
import dayjs from 'dayjs';
import head from 'lodash-es/head';
interface PatientScheduledVisitsProps {
  toggleSearchType: (searchMode: SearchTypes, patientUuid, mode) => void;
  patientUuid: string;
  closePanel: () => void;
}

enum visitType {
  RECENT = 'Recent',
  FUTURE = 'Future',
}

const ScheduledVisits: React.FC<{
  visits;
  visitType;
  scheduledVisitHeader;
  patientUuid;
  closePanel: () => void;
}> = ({ visits, scheduledVisitHeader, patientUuid, closePanel }) => {
  const { t } = useTranslation();
  const [visitsIndex, setVisitsIndex] = useState(0);
  const [hasPriority, setHasPriority] = useState(false);
  const [priority, setPriority] = useState('');
  const { priorities } = usePriority();
  const { statuses } = useStatus();
  const [userLocation, setUserLocation] = useState('');
  const locations = useLocations();
  const session = useSession();
  const { services } = useServices(userLocation);
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const allVisitTypes = useVisitTypes();
  const { currentVisit } = useVisit(patientUuid);
  const config = useConfig() as ConfigObject;

  useEffect(() => {
    if (!userLocation && session?.sessionLocation !== null) {
      setUserLocation(session?.sessionLocation?.uuid);
    } else if (!userLocation && locations) {
      setUserLocation(head(locations)?.uuid);
    }
  }, [session, locations, userLocation]);

  const handleSubmit = useCallback(
    (event) => {
      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);
      const visitType = [...allVisitTypes].shift().uuid;

      const payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
          ),
        ),
        visitType: visitType,
        location: userLocation,
      };

      const service = head(services)?.uuid;
      const defaultStatus = config.concepts.defaultStatusConceptUuid;
      const defaultPriority = config.concepts.defaultPriorityConceptUuid;

      const abortController = new AbortController();
      if (currentVisit) {
        showNotification({
          title: t('startVisitError', 'Error starting visit'),
          kind: 'error',
          critical: true,
          description: t('patientHasActiveVisit', 'The patient already has an active visit'),
        });
        setIsSubmitting(false);
      } else {
        saveVisit(payload, abortController)
          .pipe(first())
          .subscribe(
            (response) => {
              if (response.status === 201) {
                const queuePayload: QueueEntryPayload = {
                  visit: {
                    uuid: response.data.uuid,
                  },
                  queueEntry: {
                    status: {
                      uuid: defaultStatus,
                    },
                    priority: {
                      uuid: priority ? priority : defaultPriority,
                    },
                    queue: {
                      uuid: service,
                    },
                    patient: {
                      uuid: patientUuid,
                    },
                    startedAt: toDateObjectStrict(toOmrsIsoString(new Date())),
                  },
                };

                saveQueueEntry(queuePayload, abortController)
                  .pipe(first())
                  .subscribe(
                    (response) => {
                      if (response.status === 201) {
                        showToast({
                          kind: 'success',
                          title: t('startVisit', 'Start a visit'),
                          description: t(
                            'startVisitQueueSuccessfully',
                            'Patient has been added to active visits list and queue.',
                            `${hours} : ${minutes}`,
                          ),
                        });
                        closePanel();
                        setIsSubmitting(false);
                        mutate(`/ws/rest/v1/visit-queue-entry?v=full`);
                      }
                    },
                    (error) => {
                      showNotification({
                        title: t('queueEntryError', 'Error adding patient to the queue'),
                        kind: 'error',
                        critical: true,
                        description: error?.message,
                      });
                      setIsSubmitting(false);
                    },
                  );
              }
            },
            (error) => {
              showNotification({
                title: t('startVisitError', 'Error starting visit'),
                kind: 'error',
                critical: true,
                description: error?.message,
              });
              setIsSubmitting(false);
            },
          );
      }
    },
    [
      visitTime,
      timeFormat,
      allVisitTypes,
      patientUuid,
      visitDate,
      userLocation,
      services,
      statuses,
      priority,
      currentVisit,
      priorities,
      t,
      closePanel,
      mutate,
    ],
  );

  if (visits) {
    return (
      <div className={styles.row}>
        <p className={styles.heading}>{scheduledVisitHeader} </p>
        {visits?.length > 0 ? (
          <TileGroup name="tile-group" defaultSelected="default-selected">
            {visits?.map((visit, ind) => {
              return (
                <RadioTile
                  value={visit.uuid}
                  key={visit.uuid}
                  className={styles.visitTile}
                  onClick={(e) => {
                    setHasPriority(true);
                    setVisitsIndex(ind);
                  }}>
                  <div className={styles.helperText}>
                    <p className={styles.primaryText}>{visit.service?.name}</p>
                    <p className={styles.secondaryText}>
                      {' '}
                      {formatDatetime(parseDate(visit?.startDateTime))} · {visit.service?.location?.name}{' '}
                    </p>

                    {hasPriority && ind == visitsIndex ? (
                      <ContentSwitcher
                        size="sm"
                        selectedIndex={1}
                        className={styles.prioritySwitcher}
                        onChange={(e) => {
                          setPriority(e.name as any);
                          handleSubmit(e);
                        }}>
                        {priorities?.length > 0 ? (
                          priorities.map(({ uuid, display }) => {
                            return <Switch name={uuid} text={display} value={uuid} />;
                          })
                        ) : (
                          <Switch
                            name={t('noPriorityFound', 'No priority found')}
                            text={t('noPriorityFound', 'No priority found')}
                            value={null}
                          />
                        )}
                      </ContentSwitcher>
                    ) : null}
                    {hasPriority && ind == visitsIndex && isSubmitting ? (
                      <InlineLoading description={t('loading', 'Loading...')} />
                    ) : null}
                  </div>
                </RadioTile>
              );
            })}
          </TileGroup>
        ) : (
          <div className={styles.emptyAppointment}>
            <p>{t('noAppointmentsFound', 'No appointments found')} </p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={styles.emptyAppointment}>
      <p className={styles.heading}> {scheduledVisitHeader} </p>
    </div>
  );
};

const PatientScheduledVisits: React.FC<PatientScheduledVisitsProps> = ({
  toggleSearchType,
  patientUuid,
  closePanel,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { appointments, isLoading, isError } = useScheduledVisits(patientUuid, new AbortController());

  if (isError) {
    return <ErrorState headerTitle={t('errorFetchingAppoinments', 'Error fetching appointments')} error={isError} />;
  }

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (isNil(appointments?.futureVisits) && isNil(appointments?.recentVisits)) {
    toggleSearchType(SearchTypes.VISIT_FORM, patientUuid, true);
  }

  return (
    <div className={styles.container}>
      <ScheduledVisits
        visitType={visitType.RECENT}
        visits={appointments?.recentVisits}
        scheduledVisitHeader={t('recentScheduledVisits', '{count} visit(s) scheduled for +/- 7 days', {
          count: appointments?.recentVisits?.length,
        })}
        patientUuid={patientUuid}
        closePanel={closePanel}
      />
      <ScheduledVisits
        visitType={visitType.FUTURE}
        visits={appointments?.futureVisits}
        scheduledVisitHeader={t('futureScheduledVisits', '{count} visit(s) scheduled for dates in the future', {
          count: appointments?.futureVisits?.length,
        })}
        patientUuid={patientUuid}
        closePanel={closePanel}
      />

      <div className={styles['text-divider']}>{t('or', 'Or')}</div>

      <div className={styles.buttonContainer}>
        <Button
          kind="ghost"
          iconDescription="Start another visit type"
          onClick={() => toggleSearchType(SearchTypes.VISIT_FORM, patientUuid, false)}>
          {t('anotherVisitType', 'Start another visit type')}
        </Button>
      </div>

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button
          className={styles.button}
          kind="secondary"
          onClick={() => toggleSearchType(SearchTypes.BASIC, patientUuid, false)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('search', 'Search')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default PatientScheduledVisits;
