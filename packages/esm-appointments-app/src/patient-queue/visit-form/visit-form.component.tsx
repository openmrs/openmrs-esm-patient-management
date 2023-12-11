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
  useConfig,
  useLocations,
} from '@openmrs/esm-framework';
import isEmpty from 'lodash-es/isEmpty';
import BaseVisitType from './base-visit-type.component';
import { amPm, convertTime12to24, useAppointmentDate } from '../../helpers';
import { closeOverlay } from '../../hooks/useOverlay';
import { saveQueueEntry } from './queue.resource';
import { MappedAppointment } from '../../types';
import { useAppointments } from '../../appointments/appointments-table.resource';
import { useDefaultLoginLocation } from '../../hooks/useDefaultLocation';
import { useVisits } from '../../hooks/useVisits';
import styles from './visit-form.scss';

interface VisitFormProps {
  patientUuid: string;
  appointment: MappedAppointment;
}

const VisitForm: React.FC<VisitFormProps> = ({ patientUuid, appointment }) => {
  const { t } = useTranslation();
  const { currentAppointmentDate } = useAppointmentDate();
  const isTablet = useLayoutType() === 'tablet';
  const sessionUser = useSession();
  const locations = useLocations();
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(sessionUser?.sessionLocation?.uuid ?? '');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const { mutate } = useAppointments(currentAppointmentDate);
  const { mutateVisit } = useVisits();
  const { isLoading, patient } = usePatient(patientUuid);
  const config = useConfig();
  const visitQueueNumberAttributeUuid = config.concepts.visitQueueNumberAttributeUuid;
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();

  useEffect(() => {
    if (locations?.length && sessionUser) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
      setVisitType(allVisitTypes?.length > 0 ? allVisitTypes[0].uuid : null);
    } else if (!loadingDefaultFacility && defaultFacility) {
      setSelectedLocation(defaultFacility?.uuid);
      setVisitType(allVisitTypes?.length > 0 ? allVisitTypes[0].uuid : null);
    }
  }, [locations, sessionUser, loadingDefaultFacility]);

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
        startDatetime: new Date(
          dayjs(visitDate).year(),
          dayjs(visitDate).month(),
          dayjs(visitDate).date(),
          hours,
          minutes,
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
              if (config.showServiceQueueFields) {
                // retrieve values from queue extension

                const queueLocation = event?.target['queueLocation']?.value;
                const serviceUuid = event?.target['service']?.value;
                const priority = event?.target['priority']?.value;
                const status = event?.target['status']?.value;
                const sortWeight = event?.target['sortWeight']?.value;
                saveQueueEntry(
                  response.data.uuid,
                  serviceUuid,
                  patientUuid,
                  priority,
                  status,
                  sortWeight,
                  new AbortController(),
                  queueLocation,
                  visitQueueNumberAttributeUuid,
                ).then(
                  ({ status }) => {
                    if (status === 201) {
                      mutate();
                      showToast({
                        kind: 'success',
                        title: t('visitStarted', 'Visit started'),
                        description: t(
                          'queueAddedSuccessfully',
                          `Patient has been added to the queue successfully.`,
                          `${hours} : ${minutes}`,
                        ),
                      });
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
              mutate();
              mutateVisit();
              closeOverlay();
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
    [visitType, visitTime, timeFormat, patientUuid, visitDate, selectedLocation, t, mutate, currentAppointmentDate],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <div>
        {isTablet ? (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot name="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        ) : isLoading ? (
          <SkeletonText />
        ) : (
          <ExtensionSlot
            name="patient-header-slot"
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
                  labelText={t('selectFacility', 'Select a facility')}
                  id="location"
                  invalidText="Required"
                  value={selectedLocation}
                  defaultSelected={selectedLocation}
                  onChange={(event) => setSelectedLocation(event.target.value)}>
                  {!selectedLocation ? <SelectItem text={t('selectOption', 'Select an option')} value="" /> : null}
                  {!isEmpty(defaultFacility) ? (
                    <SelectItem
                      key={defaultFacility?.uuid}
                      text={defaultFacility?.display}
                      value={defaultFacility?.uuid}>
                      {defaultFacility?.display}
                    </SelectItem>
                  ) : locations?.length > 0 ? (
                    locations.map((location) => (
                      <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                        {location.display}
                      </SelectItem>
                    ))
                  ) : null}
                </Select>
              </Layer>
            ) : (
              <Select
                labelText={t('selectFacility', 'Select a facility')}
                id="location"
                invalidText="Required"
                value={selectedLocation}
                defaultSelected={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}>
                {!selectedLocation ? <SelectItem text={t('selectOption', 'Select an option')} value="" /> : null}
                {!isEmpty(defaultFacility) ? (
                  <SelectItem key={defaultFacility?.uuid} text={defaultFacility?.display} value={defaultFacility?.uuid}>
                    {defaultFacility?.display}
                  </SelectItem>
                ) : locations?.length > 0 ? (
                  locations.map((location) => (
                    <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                      {location.display}
                    </SelectItem>
                  ))
                ) : null}
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

          {/* Queue location and queue fields. These get shown when queue location and queue fields are configured */}
          {config.showServiceQueueFields && <ExtensionSlot name="add-queue-entry-slot" />}
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeOverlay}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('addPatientToQueue', 'Add patient to queue')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default VisitForm;
