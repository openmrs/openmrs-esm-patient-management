import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { first } from 'rxjs/operators';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  InlineNotification,
  Layer,
  Row,
  Select,
  SelectItem,
  Stack,
  Switch,
  TimePicker,
  TimePickerSelect,
  SkeletonText,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  useLocations,
  useSession,
  ExtensionSlot,
  useLayoutType,
  useVisitTypes,
  NewVisitPayload,
  saveVisit,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
  usePatient,
} from '@openmrs/esm-framework';
import styles from './visit-form.scss';
import BaseVisitType from './base-visit-type.component';
import { saveQueueEntry } from './queue.resource';
import { useSWRConfig } from 'swr';
import isNull from 'lodash-es/isNull';
import { amPm, convertTime12to24, startDate } from '../../helpers';
import { closeOverlay } from '../../hooks/useOverlay';
import { usePriority, useServices, useStatus } from './useVisit';
import { MappedAppointment } from '../../types';
import { changeAppointmentStatus } from '../../change-appointment-status/appointment-status.resource';

interface VisitFormProps {
  patientUuid: string;
  appointment: MappedAppointment;
}

const VisitForm: React.FC<VisitFormProps> = ({ patientUuid, appointment }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const [priority, setPriority] = useState('');
  const { priorities } = usePriority();
  const { statuses } = useStatus();
  const { services: allServices } = useServices(selectedLocation);
  const { mutate } = useSWRConfig();
  const [service, setSelectedService] = useState('');
  const { isLoading, patient } = usePatient(patientUuid);

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!visitType) {
        setIsMissingVisitType(true);
        return;
      }

      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);

      const payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
          ),
        ),
        visitType: visitType,
        location: selectedLocation,
      };

      const abortController = new AbortController();
      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              if (isNull(service)) {
                const [uuid] = allServices;
                setSelectedService(uuid);
              }
              const status = statuses.find((data) => data.display.toLowerCase() === 'waiting')?.uuid;
              const defaultPriority = priorities.find((data) => data.display.toLowerCase() === 'not urgent').uuid;

              const queuePayload = {
                visit: {
                  uuid: response.data.uuid,
                },
                queueEntry: {
                  status: {
                    uuid: status,
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
                  async (response) => {
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
                      await changeAppointmentStatus('CheckedIn', appointment.id, new AbortController());
                      mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=Scheduled`);
                      closeOverlay();
                    }
                  },
                  (error) => {
                    showNotification({
                      title: t('queueEntryError', 'Error adding patient to the queue'),
                      kind: 'error',
                      critical: true,
                      description: error?.message,
                    });
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
          },
        );
    },
    [
      visitType,
      visitTime,
      timeFormat,
      patientUuid,
      visitDate,
      selectedLocation,
      service,
      statuses,
      priority,
      allServices,
      priorities,
      t,
    ],
  );

  return (
    <Form className={styles.form}>
      <div>
        {isTablet ? (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        ) : isLoading ? (
          <SkeletonText />
        ) : (
          <ExtensionSlot
            extensionSlotName="patient-header-slot"
            state={{
              patient,
              patientUuid: appointment.patientUuid,
            }}
          />
        )}
        <Stack gap={8} className={styles.container}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={styles.dateTimeSection}>
              {isTablet ? (
                <Layer>
                  <DatePicker
                    dateFormat="d/m/Y"
                    datePickerType="single"
                    id="visitDate"
                    style={{ paddingBottom: '1rem' }}
                    maxDate={new Date().toISOString()}
                    onChange={([date]) => setVisitDate(date)}
                    value={visitDate}>
                    <DatePickerInput
                      id="visitStartDateInput"
                      labelText={t('date', 'Date')}
                      placeholder="dd/mm/yyyy"
                      style={{ width: '100%' }}
                    />
                  </DatePicker>
                </Layer>
              ) : (
                <DatePicker
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  id="visitDate"
                  style={{ paddingBottom: '1rem' }}
                  maxDate={new Date().toISOString()}
                  onChange={([date]) => setVisitDate(date)}
                  value={visitDate}>
                  <DatePickerInput
                    id="visitStartDateInput"
                    labelText={t('date', 'Date')}
                    placeholder="dd/mm/yyyy"
                    style={{ width: '100%' }}
                  />
                </DatePicker>
              )}
              {isTablet ? (
                <Layer>
                  <TimePicker
                    id="visitStartTime"
                    labelText={t('time', 'Time')}
                    onChange={(event) => setVisitTime(event.target.value as amPm)}
                    pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                    style={{ marginLeft: '0.125rem', flex: 'none' }}
                    value={visitTime}>
                    <TimePickerSelect
                      id="visitStartTimeSelect"
                      onChange={(event) => setTimeFormat(event.target.value as amPm)}
                      value={timeFormat}
                      labelText={t('time', 'Time')}
                      aria-label={t('time', 'Time')}>
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                </Layer>
              ) : (
                <TimePicker
                  id="visitStartTime"
                  labelText={t('time', 'Time')}
                  onChange={(event) => setVisitTime(event.target.value as amPm)}
                  pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                  style={{ marginLeft: '0.125rem', flex: 'none' }}
                  value={visitTime}>
                  <TimePickerSelect
                    id="visitStartTimeSelect"
                    onChange={(event) => setTimeFormat(event.target.value as amPm)}
                    value={timeFormat}
                    labelText={t('time', 'Time')}
                    aria-label={t('time', 'Time')}>
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                </TimePicker>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
            {isTablet ? (
              <Layer>
                <Select
                  labelText={t('selectLocation', 'Select a location')}
                  id="location"
                  invalidText="Required"
                  value={selectedLocation}
                  onChange={(event) => setSelectedLocation(event.target.value)}>
                  {locations?.length > 0 &&
                    locations.map((location) => (
                      <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                        {location.display}
                      </SelectItem>
                    ))}
                </Select>
              </Layer>
            ) : (
              <Select
                labelText={t('selectLocation', 'Select a location')}
                id="location"
                invalidText="Required"
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}>
                {locations?.length > 0 &&
                  locations.map((location) => (
                    <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                      {location.display}
                    </SelectItem>
                  ))}
              </Select>
            )}
          </section>
          <section>
            <div className={styles.sectionTitle}>{t('visitType', 'Visit Type')}</div>
            <ContentSwitcher className={styles.contentSwitcher}>
              <Switch name="all" text={t('all', 'All')} />
            </ContentSwitcher>
            <BaseVisitType
              onChange={(visitType) => {
                setVisitType(visitType);
                setIsMissingVisitType(false);
              }}
              visitTypes={allVisitTypes}
              patientUuid={patientUuid}
            />
          </section>
          {isMissingVisitType && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingVisitType', 'Missing visit type')}
                subtitle={t('selectVisitType', 'Please select a Visit Type')}
              />
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('service', 'Service')}</div>
            <Select
              labelText={t('selectService', 'Select a service')}
              id="service"
              invalidText="Required"
              value={service}
              onChange={(event) => setSelectedService(event.target.value)}>
              {!service ? <SelectItem text={t('chooseService', 'Select a service')} value="" /> : null}
              {allServices?.length > 0 &&
                allServices.map((service) => (
                  <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                    {service.display}
                  </SelectItem>
                ))}
            </Select>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
            <ContentSwitcher
              size="sm"
              selectionMode="manual"
              onChange={(event) => {
                setPriority(event.name as any);
              }}>
              {priorities?.length > 0 ? (
                priorities.map(({ uuid, display }) => {
                  return <Switch name={uuid} text={display} value={uuid} index={uuid} />;
                })
              ) : (
                <Switch
                  name={t('noPriorityFound', 'No priority found')}
                  text={t('noPriorityFound', 'No priority found')}
                  value={null}
                />
              )}
            </ContentSwitcher>
          </section>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeOverlay}>
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('addPatientToQueue', 'Add patient to queue')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default VisitForm;
