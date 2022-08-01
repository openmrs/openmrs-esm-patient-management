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
} from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './edit-appointment.scss';
import { mockFrequency, mockServices, mockProviders } from '../../../../__mocks__/appointments.mock';
import { useLocations, useSession, showToast, showNotification, ExtensionSlot } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { AppointmentPayload } from '../types';
import { convertTime12to24, amPm } from '../helpers';
import { editAppointment, weekdays, usePatient } from '../appoinments-tabs/appointments-table.resource';

interface EditAppointmentProps {
  patientUuid: string;
}
const EditAppointment: React.FC<EditAppointmentProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const { patient, isLoading } = usePatient(patientUuid);
  const locations = useLocations();
  const sessionUser = useSession();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [reminder, setReminder] = useState('');
  const [appointmentComment, setAppointmentComment] = useState('');
  const [reason, setReason] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [isFullDay, setIsFullDay] = useState<boolean>(false);
  const [day, setDay] = useState('');

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  const handleSubmit = () => {
    const serviceUuid = mockServices.data.find((service) => service.name === selectedService)?.uuid;
    const [hours, minutes] = convertTime12to24(startDate, timeFormat);

    const startDatetime = new Date(
      dayjs(startDate).year(),
      dayjs(startDate).month(),
      dayjs(startDate).date(),
      hours,
      minutes,
    );

    const endDatetime = dayjs(
      new Date(dayjs(startDate).year(), dayjs(startDate).month(), dayjs(startDate).date(), hours, minutes),
    ).toDate();

    const appointmentPayload: AppointmentPayload = {
      // appointmentKind: selectedAppointmentType,
      serviceUuid: serviceUuid,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      providerUuid: selectedProvider,
      comments: appointmentComment,
      locationUuid: selectedLocation,
      patientUuid: patientUuid,
    };

    const abortController = new AbortController();
    editAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
        }
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

  return (
    <div className={styles.formContainer}>
      <ExtensionSlot
        extensionSlotName="patient-info-banner-slot"
        state={{
          patient,
          patientUuid: patientUuid,
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
      </div>

      <div className={styles.childRow}>
        {!isFullDay ? (
          <div className={styles.row}>
            <TimePicker
              light
              pattern="([\d]+:[\d]{2})"
              onChange={(event) => setStartDate(event.target.value)}
              value={startDate}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
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
              pattern="([\d]+:[\d]{2})"
              onChange={(event) => setEndDate(event.target.value)}
              value={endDate}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
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
              {weekdays?.length > 0 &&
                weekdays.map((day) => (
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
        {!selectedService ? <SelectItem text={t('chooseService', 'Select service')} value="" /> : null}
        {mockServices.data?.length > 0 &&
          mockServices.data.map((service) => (
            <SelectItem key={service.uuid} text={service.name} value={service.name}>
              {service.name}
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
        {mockProviders.data?.length > 0 &&
          mockProviders.data.map((provider) => (
            <SelectItem key={provider.person.uuid} text={provider.person.display} value={provider.person.display}>
              {provider.person.display}
            </SelectItem>
          ))}
      </Select>

      <p>{t('getAppointmentReminder', 'Would you like to get a remider about this appointment?')}</p>
      <RadioButtonGroup
        defaultSelected="No"
        orientation="vertical"
        className={styles.inputContainer}
        onChange={(event) => setReminder(event.toLocaleString)}
        name="appointment-reminder-radio-group">
        <RadioButton className={styles.radioButton} id="Yes" labelText="Yes" value={reminder} />
        <RadioButton className={styles.radioButton} id="No" labelText="No" value={reminder} />
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
    </div>
  );
};

export default EditAppointment;
