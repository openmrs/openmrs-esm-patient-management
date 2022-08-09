import React, { useState, useEffect } from 'react';
import {
  Toggle,
  TimePicker,
  TimePickerSelect,
  Select,
  SelectItem,
  Switch,
  ContentSwitcher,
  RadioButtonGroup,
  RadioButton,
  TextArea,
  DatePicker,
  DatePickerInput,
  Button,
  ButtonSet,
} from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './edit-appointment-form.scss';
import { mockFrequency } from '../../../../__mocks__/appointments.mock';

import {
  useLocations,
  useSession,
  showToast,
  showNotification,
  ExtensionSlot,
  usePatient,
  useConfig,
  parseDate,
} from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { AppointmentPayload, MappedAppointment } from '../types';
import { convertTime12to24, amPm, startDate as startFilterDate } from '../helpers';
import { saveAppointment, useServices } from '../appoinments-tabs/appointments-table.resource';
import { ConfigObject } from '../config-schema';
import { useProviders } from '../hooks/useProviders';
import { closeOverlay } from '../hooks/useOverlay';
interface AppointmentFormProps {
  appointment: MappedAppointment;
  mutate: () => void;
}
const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, mutate = () => {} }) => {
  const { t } = useTranslation();

  const { appointmentKinds } = useConfig() as ConfigObject;
  const { daysOfTheWeek } = useConfig() as ConfigObject;
  const { appointmentStatuses } = useConfig() as ConfigObject;
  const { patient } = usePatient(appointment.patientUuid);
  const locations = useLocations();
  const session = useSession();
  const { providers } = useProviders();
  const { services } = useServices();
  const [startDate, setStartDate] = useState(appointment.dateTime);
  const [endDate, setEndDate] = useState(appointment.dateTime);
  const [frequency, setFrequency] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(appointment.location);
  const [selectedService, setSelectedService] = useState(appointment.serviceUuid);
  const [selectedProvider, setSelectedProvider] = useState(session?.currentProvider?.uuid);
  const [reminder, setReminder] = useState('');
  const [appointmentComment, setAppointmentComment] = useState(appointment.comments);
  const [reason, setReason] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = React.useState<Date>(appointment.dateTime ? parseDate(appointment.dateTime) : null);
  const [isFullDay, setIsFullDay] = useState<boolean>(false);
  const [day, setDay] = useState(appointment.dateTime);
  const [appointmentKind, setAppointmentKind] = useState(appointment.appointmentKind);
  const [appointmentStatus, setAppointmentStatus] = useState(appointment.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: providers } = useProviders();

  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = () => {
    const visitDatetime = dayjs(visitDate.setHours(0, 0, 0, 0)).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    const providerUuid = providers.find((provider) => provider.display === selectedProvider)?.uuid;

    const appointmentPayload: AppointmentPayload = {
      appointmentKind: appointmentKind,
      status: appointmentStatus,
      serviceUuid: selectedService,
      startDateTime: dayjs(visitDatetime).format(),
      endDateTime: dayjs(visitDatetime).format(),
      providerUuid: providerUuid,
      comments: appointmentComment,
      locationUuid: selectedLocation,
      patientUuid: appointment.patientUuid,
      appointmentNumber: appointment.appointmentNumber,
      uuid: appointment.id,
    };

    const abortController = new AbortController();
    setIsSubmitting(true);
    saveAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
          setIsSubmitting(false);
          mutate();
          closeOverlay();
        }
      },
      (error) => {
        showNotification({
          title: t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
        setIsSubmitting(false);
      },
    );
  };

  return (
    <div className={styles.formContainer}>
      <ExtensionSlot
        extensionSlotName="patient-header-slot"
        state={{
          patient,
          patientUuid: appointment.patientUuid,
        }}
      />

      <p>{t('appointmentDateAndTime', 'Appointments Date and Time')}</p>

      <div className={styles.row}>
        <Toggle onToggle={(value) => setIsFullDay(value)} id="allDay" labelA="Off" labelB="On" labelText="All Day" />
        <DatePicker
          dateFormat="d/m/Y"
          datePickerType="single"
          id="visitDate"
          light
          style={{ paddingBottom: '1rem' }}
          minDate={new Date().toISOString()}
          onChange={([date]) => setVisitDate(date)}
          value={visitDate}>
          <DatePickerInput
            id="visitStartDateInput"
            labelText={t('date', 'Date')}
            placeholder="dd/mm/yyyy"
            style={{ width: '100%' }}
          />
        </DatePicker>
      </div>

      <div className={styles.childRow}>
        {!isFullDay ? (
          <div className={styles.row}>
            <TimePicker
              light
              className={styles.timePickerInput}
              pattern="([\d]+:[\d]{2})"
              onChange={(event) => setStartDate(event.target.value)}
              value={startDate}
              labelText={t('startTime', 'Start Time')}
              id="start-time-picker">
              <TimePickerSelect
                id="start-time-picker"
                onChange={(event) => setTimeFormat(event.target.value as amPm)}
                value={timeFormat}
                labelText={t('time', 'Time')}
                aria-label={t('time', 'Time')}>
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>

            <TimePicker
              light
              className={styles.timePickerInput}
              pattern="([\d]+:[\d]{2})"
              onChange={(event) => setEndDate(event.target.value)}
              value={endDate}
              labelText={t('endTime', 'End Time')}
              id="end-time-picker">
              <TimePickerSelect
                id="end-time-picker"
                onChange={(event) => setTimeFormat(event.target.value as amPm)}
                value={timeFormat}
                labelText={t('time', 'Time')}
                aria-label={t('time', 'Time')}>
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>
          </div>
        ) : null}

        <div className={styles.row}>
          <Select
            labelText={t('frequency', 'Frequency')}
            id="frequency"
            className={styles.select}
            invalidText="Required"
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

          {isFullDay ? (
            <Select
              labelText={t('day', 'Day')}
              id="day"
              invalidText="Required"
              value={day}
              onChange={(event) => setDay(event.target.value)}
              light>
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

      <div className={styles.inputContainer}>
        <p>{t('selectAppointmentLocation', 'Select where the appointment will take place')}</p>
        <ContentSwitcher className={styles.inputContainer}>
          <Switch value="facility" id="facility" text={t('facility', 'Facility')}>
            {t('facility', 'Facility')}
          </Switch>
          <Switch value="community" id="community" text={t('community', 'Community')}>
            {t('community', 'Community')}
          </Switch>
        </ContentSwitcher>
      </div>

      <Select
        labelText={t('selectLocation', 'Select a location')}
        id="location"
        invalidText="Required"
        value={selectedLocation}
        className={styles.inputContainer}
        onChange={(event) => setSelectedLocation(event.target.value)}
        light>
        {locations?.length > 0 &&
          locations.map((location) => (
            <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
              {location.display}
            </SelectItem>
          ))}
      </Select>

      <Select
        id="service"
        invalidText="Required"
        labelText={t('selectService', 'Select a service')}
        light
        className={styles.inputContainer}
        onChange={(event) => setSelectedService(event.target.value)}
        value={selectedService}>
        {!selectedService || selectedService == '--' ? (
          <SelectItem text={t('chooseService', 'Select service')} value="" />
        ) : null}
        {services?.length > 0 &&
          services.map((service) => (
            <SelectItem key={service.uuid} text={service.name} value={service.uuid}>
              {service.name}
            </SelectItem>
          ))}
      </Select>

      <Select
        id="appointmentKind"
        invalidText="Required"
        labelText={t('selectAppointmentKind', 'Select an appointment kind')}
        light
        className={styles.inputContainer}
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

      <Select
        id="appointmentStatus"
        invalidText="Required"
        labelText={t('selectAppointmentStatus', 'Select status')}
        light
        className={styles.inputContainer}
        onChange={(event) => setAppointmentStatus(event.target.value)}
        value={appointmentStatus}>
        {!appointmentStatus || appointmentStatus == '--' ? (
          <SelectItem text={t('selectAppointmentStatus', 'Select status')} value="" />
        ) : null}
        {appointmentStatuses?.length > 0 &&
          appointmentStatuses.map((service) => (
            <SelectItem key={service} text={service} value={service}>
              {service}
            </SelectItem>
          ))}
      </Select>

      <Select
        id="providers"
        invalidText="Required"
        labelText={t('selectProvider', 'Select a provider')}
        light
        className={styles.inputContainer}
        onChange={(event) => setSelectedProvider(event.target.value)}
        value={selectedProvider}>
        {!selectedProvider ? <SelectItem text={t('chooseProvider', 'Select Provider')} value="" /> : null}
        {providers?.length > 0 &&
          providers.map((provider) => (
            <SelectItem key={provider.uuid} text={provider.display} value={provider.display}>
              {provider.display}
            </SelectItem>
          ))}
      </Select>

      <p>{t('getAppointmentReminder', 'Would you like to get a remider about this appointment?')}</p>
      <RadioButtonGroup
        defaultSelected="No"
        orientation="vertical"
        className={styles.inputContainer}
        onChange={(event) => {
          setReminder(event.toString());
        }}
        name="appointment-reminder-radio-group">
        <RadioButton className={styles.radioButton} id="Yes" labelText="Yes" value="Yes" />
        <RadioButton className={styles.radioButton} id="No" labelText="No" value="No" />
      </RadioButtonGroup>

      <TextArea
        id="appointmentComment"
        light
        value={appointmentComment}
        className={styles.inputContainer}
        labelText={t('comments', 'Comments')}
        onChange={(event) => setAppointmentComment(event.target.value)}
      />

      <TextArea
        id="reason"
        light
        value={reason}
        className={styles.inputContainer}
        labelText={t('reasonForChanges', 'Reason For Changes')}
        onChange={(event) => setReason(event.target.value)}
      />

      <ButtonSet>
        <Button className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default AppointmentForm;
