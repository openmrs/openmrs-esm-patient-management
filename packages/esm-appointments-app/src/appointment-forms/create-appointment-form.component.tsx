import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import dayjs from 'dayjs';
import {
  Button,
  DatePickerInput,
  DatePicker,
  SearchSkeleton,
  Select,
  SelectItem,
  TextArea,
  TimePickerSelect,
  TimePicker,
  ContentSwitcher,
  Switch,
  FormGroup,
  RadioButtonGroup,
  RadioButton,
  Toggle,
} from '@carbon/react';
import {
  useLocations,
  useSession,
  showToast,
  showNotification,
  useLayoutType,
  ExtensionSlot,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import { useAppointmentSummary, saveAppointment, useServices, fetchAppointments } from './appointment-forms.resource';
import { AppointmentPayload } from '../types';
import { convertTime12to24, amPm } from '../helpers/time.helpers';
import { ConfigObject } from '../config-schema';
import { mockFrequency } from '../../../../__mocks__/appointments.mock';
import { closeOverlay } from '../hooks/useOverlay';
import { useProviders } from '../hooks/useProviders';
import { startDate as fromDate } from '../helpers';

import styles from './create-appointment-form.scss';
import WorkloadCard from './workload.component';
import first from 'lodash-es/first';

interface AppointmentFormProps {
  patientUuid: string;
}

const CreateAppointmentsForm: React.FC<AppointmentFormProps> = ({ patientUuid }) => {
  const { patient } = usePatient(patientUuid);
  const { appointmentKinds } = useConfig() as ConfigObject;
  const { daysOfTheWeek } = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { mutate } = useSWRConfig();
  const locations = useLocations();
  const { providers } = useProviders();
  const session = useSession();
  const [appointmentNote, setAppointmentNote] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [endTime, setEndTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [userLocation, setUserLocation] = useState('');
  const [appointmentReminder, setAppointmentReminder] = useState(null);
  const [appointmentKind, setAppointmentKind] = useState('');
  const [frequency, setFrequency] = useState('');
  const [day, setDay] = useState('');
  const [allDayOn, setAllDayOn] = useState(false);

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  const { services, isLoading } = useServices();
  const serviceUuid = services.find((service) => service.name === selectedService)?.uuid;
  const appointmentSummary = useAppointmentSummary(new Date().toString(), serviceUuid);

  const handleSubmit = () => {
    if (!selectedService) {
      return;
    }

    const providerUuid = providers.find((provider) => provider.display === selectedProvider)?.uuid;

    const [startHours, startMinutes] = convertTime12to24(startTime, timeFormat);
    const [endHours, endMinutes] = convertTime12to24(startTime, timeFormat);

    const startDateTime = new Date(
      dayjs(startDate).year(),
      dayjs(startDate).month(),
      dayjs(startDate).date(),
      startHours,
      startMinutes,
    );

    const endDateTime = new Date(
      dayjs(startDate).year(),
      dayjs(startDate).month(),
      dayjs(startDate).date(),
      endHours,
      endMinutes,
    );

    const appointmentPayload: AppointmentPayload = {
      appointmentKind,
      serviceUuid,
      startDateTime: dayjs(startDateTime).format(),
      endDateTime: dayjs(endDateTime).format(),
      providerUuid: providerUuid,
      locationUuid: userLocation,
      patientUuid: patientUuid,
      providers: [],
      comments: appointmentNote,
    };

    const abortController = new AbortController();
    saveAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          closeOverlay();
          fetchAppointments(abortController);
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
        }

        mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${fromDate}&status=Scheduled`);
      },
      (error) => {
        showNotification({
          title: t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  if (isLoading && !patient) {
    return <SearchSkeleton role="progressbar" />;
  }
  return (
    <div>
      <div className={styles.patientInfo}>
        <ExtensionSlot
          extensionSlotName="patient-header-slot"
          state={{
            patient,
            patientUuid: patientUuid,
          }}
        />
      </div>

      <div className={styles.formWrapper}>
        <section className={styles.formGroup}>
          <span>{t('appointmentDateTime', 'Appointment Date and Time')}</span>
          <div className={styles.dateTimeContainer}>
            <Toggle
              className={styles.toggle}
              aria-label="toggle button"
              id="allDay"
              toggled={allDayOn}
              labelText="All Day"
              onToggle={() => setAllDayOn(!allDayOn)}
            />
            <div className={styles.datePickerControl}>
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                light={isTablet}
                value={startDate}
                onChange={([date]) => setStartDate(date)}>
                <DatePickerInput
                  id="datePickerInput"
                  labelText={t('date', 'Date')}
                  style={{ width: '100%' }}
                  placeholder="dd/mm/yyyy"
                />
              </DatePicker>
              {allDayOn ? null : (
                <div className={styles.timePickersContainer}>
                  <TimePicker
                    light={isTablet}
                    pattern="([\d]+:[\d]{2})"
                    onChange={(event) => setStartTime(event.target.value)}
                    value={startTime}
                    style={{ marginLeft: '0.125rem', flex: 'none' }}
                    labelText={t('startTime', 'Start Time')}
                    id="time-picker">
                    <TimePickerSelect
                      id="time-picker-select-1"
                      onChange={(event) => setTimeFormat(event.target.value as amPm)}
                      value={timeFormat}
                      labelText={t('time', 'Time')}
                      aria-label={t('time', 'Time')}>
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                  <TimePicker
                    light={isTablet}
                    pattern="([\d]+:[\d]{2})"
                    onChange={(event) => setEndTime(event.target.value)}
                    value={endTime}
                    style={{ marginLeft: '0.125rem', flex: 'none' }}
                    labelText={t('endTime', 'End Time')}
                    id="time-picker">
                    <TimePickerSelect
                      id="time-picker-select-1"
                      onChange={(event) => setTimeFormat(event.target.value as amPm)}
                      value={timeFormat}
                      labelText={t('time', 'Time')}
                      aria-label={t('time', 'Time')}>
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                </div>
              )}
              <div className={styles.frequencyAndDay}>
                <Select
                  labelText={t('frequency', 'Frequency')}
                  id="frequency"
                  className={styles.select}
                  disabled
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                  light>
                  {mockFrequency.data?.length > 0 &&
                    mockFrequency.data.map((frequency) => (
                      <SelectItem key={frequency.uuid} text={frequency.display} value={frequency.uuid}>
                        {frequency.display}
                      </SelectItem>
                    ))}
                </Select>
                {allDayOn ? (
                  <Select
                    id="day"
                    disabled
                    labelText={t('day', 'Day')}
                    light={isTablet}
                    onChange={(event) => setDay(event.target.value)}
                    value={day}>
                    {daysOfTheWeek?.length > 0 &&
                      daysOfTheWeek.map((day) => (
                        <SelectItem key={day} text={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                  </Select>
                ) : null}
              </div>
            </div>
          </div>
        </section>
        <section className={styles.formGroup}>
          <span>{t('selectAppointmentLocation', 'Select where the appointment will take place')}</span>
          <div className={styles.contentSwitcherWrapper}>
            <ContentSwitcher className={styles.inputContainer}>
              <Switch value="facility" id="facility" text={t('facility', 'Facility')}>
                {t('facility', 'Facility')}
              </Switch>
              <Switch value="community" id="community" text={t('community', 'Community')}>
                {t('community', 'Community')}
              </Switch>
            </ContentSwitcher>
          </div>
        </section>
        <section className={styles.formGroup}>
          <Select
            id="location"
            invalidText="Required"
            labelText={t('location', 'Location')}
            light={isTablet}
            onChange={(event) => setUserLocation(event.target.value)}
            value={userLocation}>
            {!userLocation ? <SelectItem text={t('chooseLocation', 'Choose a location')} value="" /> : null}
            {locations?.length > 0 &&
              locations.map((location) => (
                <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                  {location.display}
                </SelectItem>
              ))}
          </Select>
        </section>

        <div className={styles.workLoadContainer}>
          {appointmentSummary.length > 0 && (
            <>
              <p className={styles.workLoadTitle}>
                {t(
                  'serviceWorkloadTitle',
                  `${selectedService} clinic work load on the week of ${dayjs(first(appointmentSummary).date).format(
                    'DD/MM',
                  )}`,
                )}
              </p>
              <div className={styles.workLoadCard}>
                {appointmentSummary?.map(({ date, count }, index) => (
                  <WorkloadCard
                    onDateSelected={(date) => setStartDate(dayjs(date).toDate)}
                    key={date}
                    date={dayjs(date).format('DD/MM')}
                    count={count}
                    isActive={dayjs(date).toDate() === startDate}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <section className={styles.formGroup}>
          <Select
            id="service"
            invalidText="Required"
            labelText={t('service', 'Service')}
            light={isTablet}
            onChange={(event) => setSelectedService(event.target.value)}
            value={selectedService}>
            {!selectedService ? <SelectItem text={t('chooseService', 'Select service')} value="" /> : null}
            {services?.length > 0 &&
              services.map((service) => (
                <SelectItem key={service.uuid} text={service.name} value={service.name}>
                  {service.name}
                </SelectItem>
              ))}
          </Select>
        </section>
        <section className={styles.formGroup}>
          <Select
            id="appointmentKind"
            invalidText="Required"
            labelText={t('selectAppointmentKind', 'Select an appointment kind')}
            light
            onChange={(event) => setAppointmentKind(event.target.value)}
            value={appointmentKind}>
            {!appointmentKind || appointmentKind == '--' ? (
              <SelectItem text={t('selectAppointmentKind', 'Select an appointment kind')} value="" />
            ) : null}
            {appointmentKinds?.length > 0 &&
              appointmentKinds.map((service) => (
                <SelectItem key={service} text={service} value={service}>
                  {service}
                </SelectItem>
              ))}
          </Select>
        </section>
        <section className={styles.formGroup}>
          <Select
            id="provider"
            labelText={t('provider', 'Provider')}
            light={isTablet}
            onChange={(event) => setSelectedProvider(event.target.value)}
            value={selectedProvider}>
            {!selectedProvider ? <SelectItem text={t('chooseProvider', 'Choose provider')} value="" /> : null}
            {providers?.length > 0 &&
              providers.map((provider) => (
                <SelectItem key={provider.uuid} text={provider.display} value={provider.uuid}>
                  {provider.display}
                </SelectItem>
              ))}
          </Select>
        </section>
        <section className={styles.formGroup}>
          <FormGroup legendText={t('appointmentReminder', 'Would Patient like to get a reminder about appointment')}>
            <RadioButtonGroup
              name="appointmentReminder"
              orientation="vertical"
              onChange={(reminder) => setAppointmentReminder(reminder.toString())}>
              <RadioButton id="yes" labelText="Yes" value="yes" />
              <RadioButton id="no" labelText="No" value="no" />
            </RadioButtonGroup>
          </FormGroup>
        </section>
        <section className={styles.formGroup}>
          <span>{t('note', 'Note')}</span>
          <TextArea
            id="appointmentNote"
            light={isTablet}
            labelText={t('appointmentNoteLabel', 'Write an additional note')}
            placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
            onChange={(event) => setAppointmentNote(event.target.value)}
          />
        </section>
        <section className={styles.buttonGroup}>
          <Button onClick={() => closeOverlay()} kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button disabled={!selectedService} onClick={handleSubmit}>
            {t('saveAndClose', 'Save and close')}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default CreateAppointmentsForm;
