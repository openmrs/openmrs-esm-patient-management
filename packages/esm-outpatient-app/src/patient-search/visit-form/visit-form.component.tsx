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
  FormGroup,
  RadioButton,
  RadioButtonGroup,
  Dropdown,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import {
  useLocations,
  useSession,
  ExtensionSlot,
  useLayoutType,
  useVisitTypes,
  saveVisit,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
  useConfig,
  ConfigObject,
} from '@openmrs/esm-framework';
import styles from './visit-form.scss';
import { SearchTypes, PatientProgram, QueueEntryPayload, NewVisitPayload } from '../../types/index';
import BaseVisitType from './base-visit-type.component';
import { convertTime12to24, amPm } from '../../helpers/time-helpers';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { useActivePatientEnrollment } from '../hooks/useActivePatientEnrollment';
import { saveQueueEntry } from './queue.resource';
import {
  usePriority,
  useServiceQueueEntries,
  useStatus,
  useVisitQueueEntries,
} from '../../active-visits/active-visits-table.resource';
import { useServices } from '../../patient-queue-metrics/queue-metrics.resource';
import { useQueueLocations } from '../hooks/useQueueLocations';
import { useSWRConfig } from 'swr';
import isNull from 'lodash-es/isNull';
import head from 'lodash-es/head';
import { generateVisitQueueNumber } from '../../helpers/functions';

interface VisitFormProps {
  toggleSearchType: (searchMode: SearchTypes, patientUuid) => void;
  patientUuid: string;
  closePanel: () => void;
  mode: boolean;
}

const StartVisitForm: React.FC<VisitFormProps> = ({ patientUuid, toggleSearchType, closePanel, mode }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const config = useConfig() as ConfigObject;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isMissingService, setIsMissingService] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const [ignoreChanges, setIgnoreChanges] = useState(true);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const [enrollment, setEnrollment] = useState<PatientProgram>(activePatientEnrollment[0]);
  const [priority, setPriority] = useState('');
  const { priorities } = usePriority();
  const { statuses } = useStatus();
  const { mutate } = useSWRConfig();
  const [service, setSelectedService] = useState('');
  const { queueLocations } = useQueueLocations();
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueLocations[0]?.id);
  const { allServices, isLoading: isLoadingServices } = useServices(selectedQueueLocation);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const { visitQueueEntriesCount } = useVisitQueueEntries(selectedServiceName, selectedQueueLocation);

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
      setVisitType(allVisitTypes?.length === 1 ? allVisitTypes[0].uuid : null);
    }
  }, [locations, sessionUser, allVisitTypes]);

  useEffect(() => {
    if (!isLoadingServices) {
      setSelectedService(allServices.length > 0 ? allServices[0].uuid : '');
      setSelectedServiceName(allServices.length > 0 ? allServices[0].display : '');
    }
  }, [isLoadingServices, allServices]);

  const handleServiceChange = ({ selectedItem }) => {
    setSelectedService(selectedItem.uuid);
    setSelectedServiceName(selectedItem.display);
  };

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!visitType) {
        setIsMissingVisitType(true);
        return;
      }

      if (!service) {
        setIsMissingService(true);
        return;
      }

      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);
      const visitQueueEntryNumber = config.generateVisitQueueNumber
        ? generateVisitQueueNumber(selectedServiceName, visitQueueEntriesCount)
        : '';

      const visitQueueNumberAttribute = {
        attributeType: config.visitQueueNumberAttributeUuid,
        value: visitQueueEntryNumber,
      };
      const payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
          ),
        ),
        visitType: visitType,
        location: selectedLocation,
        attributes: [visitQueueNumberAttribute],
      };

      const abortController = new AbortController();
      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              if (isNull(service)) {
                setSelectedService(head(allServices)?.uuid);
              }
              const defaultStatus = config.concepts.defaultStatusConceptUuid;
              const defaultPriority = config.concepts.defaultPriorityConceptUuid;
              const emergencyPriorityConceptUuid = config.concepts.emergencyPriorityConceptUuid;
              const sortWeight = priority === emergencyPriorityConceptUuid ? 1.0 : 0.0;

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
                  sortWeight: sortWeight,
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
                      mutate(`/ws/rest/v1/visit-queue-entry?v=full`);
                      mutate(`/ws/rest/v1/visit-queue-entry?location=${selectedQueueLocation}&v=full`);
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
      closePanel,
      mutate,
    ],
  );

  const handleOnChange = () => {
    setIgnoreChanges((prevState) => !prevState);
  };

  return (
    <Form className={styles.form} onChange={handleOnChange}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <div className={styles.backButton}>
          {mode === true ? null : (
            <Button
              kind="ghost"
              renderIcon={(props) => <ArrowLeft size={24} {...props} />}
              iconDescription={t('backToScheduledVisits', 'Back to scheduled visits')}
              size="sm"
              onClick={() => toggleSearchType(SearchTypes.SCHEDULED_VISITS, patientUuid)}>
              <span>{t('backToScheduledVisits', 'Back to scheduled visits')}</span>
            </Button>
          )}
        </div>
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

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueLocation', 'Queue Location')}</div>
            {isTablet ? (
              <Layer>
                <Select
                  labelText={t('selectQueueLocation', 'Select a queue location')}
                  id="location"
                  invalidText="Required"
                  value={selectedQueueLocation}
                  onChange={(event) => setSelectedQueueLocation(event.target.value)}>
                  {queueLocations?.length > 0 &&
                    queueLocations.map((location) => (
                      <SelectItem key={location.id} text={location.name} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                </Select>
              </Layer>
            ) : (
              <Select
                labelText={t('selectQueueLocation', 'Select a queue location')}
                id="location"
                invalidText="Required"
                value={selectedQueueLocation}
                onChange={(event) => setSelectedQueueLocation(event.target.value)}>
                {queueLocations?.length > 0 &&
                  queueLocations.map((location) => (
                    <SelectItem key={location.id} text={location.name} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
              </Select>
            )}
          </section>

          {config.showRecommendedVisitTypeTab && (
            <section>
              <div className={styles.sectionTitle}>{t('program', 'Program')}</div>
              <FormGroup legendText={t('selectProgramType', 'Select program type')}>
                <RadioButtonGroup
                  defaultSelected={enrollment?.program?.uuid}
                  orientation="vertical"
                  onChange={(uuid) =>
                    setEnrollment(activePatientEnrollment.find(({ program }) => program.uuid === uuid))
                  }
                  name="program-type-radio-group"
                  valueSelected="default-selected">
                  {activePatientEnrollment.map(({ uuid, display, program }) => (
                    <RadioButton
                      key={uuid}
                      className={styles.radioButton}
                      id={uuid}
                      labelText={display}
                      value={program.uuid}
                    />
                  ))}
                </RadioButtonGroup>
              </FormGroup>
            </section>
          )}
          <section>
            <div className={styles.sectionTitle}>{t('visitType', 'Visit Type')}</div>
            <ContentSwitcher
              selectedIndex={contentSwitcherIndex}
              className={styles.contentSwitcher}
              onChange={({ index }) => setContentSwitcherIndex(index)}>
              <Switch name="recommended" text={t('recommended', 'Recommended')} />
              <Switch name="all" text={t('all', 'All')} />
            </ContentSwitcher>
            {contentSwitcherIndex === 0 && !isLoading && (
              <MemoizedRecommendedVisitType
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
                patientUuid={patientUuid}
                patientProgramEnrollment={enrollment}
                locationUuid={selectedLocation}
              />
            )}
            {contentSwitcherIndex === 1 && (
              <BaseVisitType
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
                visitTypes={allVisitTypes}
                patientUuid={patientUuid}
              />
            )}
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
            {!allServices?.length ? (
              <InlineNotification
                className={styles.inlineNotification}
                kind={'error'}
                lowContrast
                subtitle={t('configureServices', 'Please configure services to continue.')}
                title={t('noServicesConfigured', 'No services configured')}
              />
            ) : (
              <Dropdown
                id="serviceFilter"
                label={t('selectService', 'Select a service')}
                type="default"
                items={allServices}
                itemToString={(item) => (item ? item.display : '')}
                onChange={handleServiceChange}
                size="md"
              />
            )}
          </section>
          {isMissingService && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingService', 'Missing service type')}
                subtitle={t('selectServiceType', 'Please select a service type')}
              />
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
            {!priorities?.length ? (
              <InlineNotification
                className={styles.inlineNotification}
                kind={'error'}
                lowContrast
                subtitle={t('configurePriorities', 'Please configure priorities to continue.')}
                title={t('noPrioritiesConfigured', 'No priorities configured')}
              />
            ) : (
              <ContentSwitcher
                size="sm"
                selectionMode="manual"
                onChange={(event) => {
                  setPriority(event.name as any);
                }}>
                {priorities?.length > 0 &&
                  priorities.map(({ uuid, display }) => {
                    return <Switch name={uuid} text={display} value={uuid} index={uuid} />;
                  })}
              </ContentSwitcher>
            )}
          </section>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closePanel}>
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('startVisit', 'Start visit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StartVisitForm;
