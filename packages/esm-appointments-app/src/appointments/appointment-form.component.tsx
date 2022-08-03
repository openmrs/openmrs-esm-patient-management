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
} from 'carbon-components-react';
import { useLocations, useSession, showToast, showNotification, useLayoutType } from '@openmrs/esm-framework';
import {
  appointmentsSearchUrl,
  createAppointment,
  useAppointmentService,
  useProviders,
} from './appointments.resources';
import { AppointmentPayload, AppointmentService } from '../types';
import { convertTime12to24, amPm } from '../helpers/time.helpers';
import PatientInfo from '../patient-info/patient-info.component';
import styles from './appointment-form.scss';

interface AppointmentFormProps {
  patientUuid: string;
  patient: fhir.Patient;
  closeWorkspace: () => void;
}

const AppointmentsForm: React.FC<AppointmentFormProps> = ({ patientUuid, patient, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { mutate } = useSWRConfig();
  const locations = useLocations();
  const session = useSession();
  const [appointmentNote, setAppointmentNote] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [endTime, setEndTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [userLocation, setUserLocation] = useState('');
  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const [appointmentReminder, setAppointmentReminder] = useState(null);
  const [frequency, setFrequency] = useState('');
  const [day, setDay] = useState('');
  const [allDayOn, setAllDayOn] = useState(false);

  const defaultFrequencies = ['Daily', 'Weekly', 'Monthly', 'Does not repeat'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const appointmentKindValues = { 0: 'Scheduled', 1: 'WalkIn' };

  if (!userLocation && session?.sessionLocation?.uuid) {
    setUserLocation(session?.sessionLocation?.uuid);
  }

  const { data: services, isLoading } = useAppointmentService();
  const { data: providers } = useProviders();

  const defaultServices = [
    { name: 'HIV Return Visit', uuid: '1a' },
    { name: 'TB Return Visit', uuid: '2a' },
    { name: 'Drug Dispense', uuid: '3a' },
  ];

  const servicesData = services?.length ? services : defaultServices;

  const handleSubmit = () => {
    if (!selectedService) {
      return;
    }

    const serviceUuid = servicesData.find((service) => service.name === selectedService)?.uuid;

    const appointmentPayload: AppointmentPayload = {
      appointmentKind: appointmentKindValues[contentSwitcherValue],
      serviceUuid: serviceUuid,
      date,
      startTime,
      endTime,
      providerUuid: session?.currentProvider?.uuid,
      provider: selectedProvider,
      locationUuid: userLocation,
      patientUuid: patientUuid,
      notes: appointmentNote,
      reminder: appointmentReminder,
      frequency,
      dayOfWeek: day,
    };

    const abortController = new AbortController();
    createAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          closeWorkspace();

          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
        }

        mutate(`${appointmentsSearchUrl}`);
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

  if (isLoading) {
    return <SearchSkeleton role="progressbar" />;
  }
  return (
    <div className={styles.formWrapper}>
      {patient ? <PatientInfo patient={patient} handlePatientInfoClick={() => {}} /> : null}
      <section className={styles.formGroup}>
        <span>{t('dateTime', 'Appointment Date and Time')}</span>
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
              value={date}
              onChange={([date]) => setDate(date)}>
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
                id="frequency"
                invalidText="Required"
                labelText={t('frequency', 'Frequency')}
                light={isTablet}
                onChange={(event) => setFrequency(event.target.value)}
                value={frequency}>
                {defaultFrequencies.map((frequency) => (
                  <SelectItem key={frequency} text={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </Select>
              {allDayOn ? (
                <Select
                  id="day"
                  invalidText="Required"
                  labelText={t('day', 'Day')}
                  light={isTablet}
                  onChange={(event) => setDay(event.target.value)}
                  value={day}>
                  {days.map((day) => (
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
        <span>{t('appointmentPlace', 'Select where appointment will take place')}</span>
        <div className={styles.contentSwitcherWrapper}>
          <ContentSwitcher
            size="md"
            onChange={({ index }) => {
              setContentSwitcherValue(index);
            }}>
            <Switch name={'scheduled'} value="Scheduled" text={t('facility', 'Facility')} />
            <Switch name={'walkin'} value="WalkIn" text={t('community', 'Community')} />
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

      <section className={styles.formGroup}>
        <Select
          id="service"
          invalidText="Required"
          labelText={t('service', 'Service')}
          light={isTablet}
          onChange={(event) => setSelectedService(event.target.value)}
          value={selectedService}>
          {!selectedService ? <SelectItem text={t('chooseService', 'Select service')} value="" /> : null}
          {servicesData?.length > 0 &&
            servicesData.map((service) => (
              <SelectItem key={service.uuid} text={service.name} value={service.name}>
                {service.name}
              </SelectItem>
            ))}
        </Select>
      </section>
      <section className={styles.formGroup}>
        <Select
          id="provider"
          invalidText="Required"
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
        <Button onClick={closeWorkspace} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button disabled={!selectedService} onClick={handleSubmit}>
          {t('saveAndClose', 'Save and close')}
        </Button>
      </section>
    </div>
  );
};

export default AppointmentsForm;
