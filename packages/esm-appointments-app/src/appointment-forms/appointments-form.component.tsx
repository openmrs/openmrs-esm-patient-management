import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isEmpty from 'lodash-es/isEmpty';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Switch,
  TextArea,
  TimePicker,
  TimePickerSelect,
  Toggle,
  SkeletonText,
} from '@carbon/react';
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
import { AppointmentPayload, MappedAppointment } from '../types';
import { amPm, convertTime12to24 } from '../helpers';
import {
  saveAppointment,
  useServices,
  useAppointmentSummary,
  checkAppointmentConflict,
} from './appointment-forms.resource';
import { ConfigObject } from '../config-schema';
import { useProviders } from '../hooks/useProviders';
import { closeOverlay } from '../hooks/useOverlay';
import { mockFrequency } from '../../__mocks__/appointments.mock';
import WorkloadCard from './workload.component';
import first from 'lodash-es/first';
import styles from './appointments-form.scss';
import { useSWRConfig } from 'swr';
import { useAppointmentDate } from '../helpers/time';
import { getWeeklyCalendarDistribution } from './workload-helper';

interface AppointmentFormProps {
  appointment?: MappedAppointment;
  patientUuid?: string;
  context: string;
}
const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, patientUuid, context }) => {
  const initialState = {
    patientUuid,
    dateTime: undefined,
    location: '',
    serviceUuid: '',
    comments: '',
    appointmentKind: '',
    status: '',
    id: undefined,
    gender: '',
    serviceType: '',
    provider: '',
    appointmentNumber: undefined,
  };
  const appointmentState = !isEmpty(appointment) ? appointment : initialState;
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { appointmentKinds } = useConfig() as ConfigObject;
  const { daysOfTheWeek } = useConfig() as ConfigObject;
  const { appointmentStatuses } = useConfig() as ConfigObject;
  const { patient, isLoading } = usePatient(patientUuid ?? appointmentState.patientUuid);
  const locations = useLocations();
  const session = useSession();
  const { providers } = useProviders();
  const { services } = useServices();
  const [startDate, setStartDate] = useState(
    dayjs(appointmentState.dateTime).format('hh:mm') || dayjs(new Date()).format('hh:mm'),
  );
  const [endDate, setEndDate] = useState(
    dayjs(appointmentState.dateTime).format('hh:mm') || dayjs(new Date()).format('hh:mm'),
  );
  const [frequency, setFrequency] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(appointmentState.location);
  const [selectedService, setSelectedService] = useState(appointmentState.serviceUuid);
  const [selectedProvider, setSelectedProvider] = useState(appointmentState.provider);
  const [reminder, setReminder] = useState('');
  const [appointmentComment, setAppointmentComment] = useState(appointmentState.comments);
  const [reason, setReason] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = React.useState(
    appointmentState.dateTime ? new Date(appointmentState.dateTime) : new Date(),
  );
  const [isFullDay, setIsFullDay] = useState<boolean>(false);
  const [day, setDay] = useState(appointmentState.dateTime);
  const [appointmentKind, setAppointmentKind] = useState(appointmentState.appointmentKind);
  const [appointmentStatus, setAppointmentStatus] = useState(appointmentState.status ?? 'Scheduled');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const appointmentStartDate = useAppointmentDate();
  const appointmentSummary = useAppointmentSummary(visitDate, selectedService);

  const weeklyDistribution = useMemo(
    () => getWeeklyCalendarDistribution(new Date(appointmentStartDate), appointmentSummary) ?? [],
    [appointmentStartDate, appointmentSummary],
  );
  const isMissingRequirements = !selectedService || !appointmentKind.length || !selectedProvider;
  const appointmentService = services?.find(({ uuid }) => uuid === selectedService);

  useEffect(() => {
    if (appointmentService) {
      const [hours, minutes] = convertTime12to24(startDate, timeFormat);
      const startDatetime = new Date(
        dayjs(visitDate).year(),
        dayjs(visitDate).month(),
        dayjs(visitDate).date(),
        hours,
        minutes,
      );
      setEndDate(
        dayjs(startDatetime)
          .add(parseInt(appointmentService?.durationMins ?? '0'), 'minutes')
          .format('hh:mm'),
      );
    }
  }, [startDate, timeFormat, appointmentService, visitDate]);

  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = async () => {
    const [hours, minutes] = convertTime12to24(startDate, timeFormat);
    const providerUuid = providers.find((provider) => provider.display === selectedProvider)?.uuid;
    const startDatetime = new Date(
      dayjs(visitDate).year(),
      dayjs(visitDate).month(),
      dayjs(visitDate).date(),
      hours,
      minutes,
    );

    const endDatetime = dayjs(
      new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
    );
    const appointmentPayload: AppointmentPayload = {
      appointmentKind: appointmentKind,
      status: appointmentStatus,
      serviceUuid: selectedService,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      providerUuid: providerUuid,
      comments: appointmentComment,
      locationUuid: selectedLocation,
      patientUuid: appointmentState.patientUuid,
      appointmentNumber: appointmentState.appointmentNumber,
      uuid: appointmentState.id,
    };

    const { data } = await checkAppointmentConflict(appointmentPayload);
    const [bookingStatus] = Object.keys(data);
    const isPatientDoubleBooking = 'PATIENT_DOUBLE_BOOKING' === bookingStatus;

    if (isPatientDoubleBooking) {
      showToast({
        critical: true,
        kind: 'warning',
        description: t(
          'doublePatientBooking',
          'There exist an appointment on the specified service and appointment date',
        ),
        title: t('doubleBooking', 'Appointment double booking'),
      });
      return;
    }

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
          mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${appointmentStartDate}&status=Scheduled`);
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
      {isLoading ? (
        <SkeletonText />
      ) : (
        <div className={styles.stickyFormHeader}>
          <ExtensionSlot
            extensionSlotName="patient-header-slot"
            state={{
              patient,
              patientUuid: appointmentState.patientUuid,
            }}
          />
        </div>
      )}

      <div className={styles.childRow}>
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

      <div className={styles.inputContainer} id="appointment-place">
        <p>{t('selectAppointmentLocation', 'Select where the appointment will take place')}</p>
        <ContentSwitcher className={styles.inputContainer} data-testid="appointment-place">
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

      <p>{t('appointmentDateAndTime', 'Appointments Date and Time')}</p>

      <div className={styles.row}>
        <Toggle onToggle={(value) => setIsFullDay(value)} id="allDay" labelA="Off" labelB="On" labelText="All Day" />
        <DatePicker
          dateFormat="d/m/Y"
          datePickerType="single"
          id="visitDate"
          light
          minDate={visitDate}
          className={styles.datePickerInput}
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
      {!isFullDay ? (
        <div className={styles.row}>
          <TimePicker
            disabled={!appointmentService}
            light
            className={styles.timePickerInput}
            pattern="([\d]+:[\d]{2})"
            onChange={(event) => setStartDate(event.target.value)}
            value={startDate}
            labelText={t('startTime', 'Start Time')}
            id="start-time-picker">
            <TimePickerSelect
              disabled={!appointmentService}
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
            disabled={!appointmentService}
            light
            className={styles.timePickerInput}
            pattern="([\d]+:[\d]{2})"
            onChange={(event) => setEndDate(event.target.value)}
            value={endDate}
            labelText={t('endTime', 'End Time')}
            id="end-time-picker">
            <TimePickerSelect
              disabled={!appointmentService}
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

      {appointmentSummary.length > 0 && (
        <div className={styles.workLoadContainer}>
          <>
            <p className={styles.workLoadTitle}>
              {t(
                'serviceWorkloadTitle',
                `${appointmentService.name} clinic work load on the week of ${dayjs(
                  first(appointmentSummary).date,
                ).format('DD/MM')}`,
              )}
            </p>
            <div className={styles.workLoadCard}>
              {weeklyDistribution?.map(({ date, count }, index) => {
                return (
                  <WorkloadCard
                    onClick={() => setVisitDate(new Date(date))}
                    key={date}
                    date={dayjs(date).format('DD/MM')}
                    count={count}
                    isActive={dayjs(date).format('DD-MM-YYYY') === dayjs(visitDate).format('DD-MM-YYYY')}
                  />
                );
              })}
            </div>
          </>
        </div>
      )}

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
      {context !== 'creating' && (
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
      )}

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

      <div className={styles.inputContainer} id="radio-group">
        <label className="cds--label">
          {t('getAppointmentReminder', 'Would you like to get a reminder about this appointment?')}
        </label>
        <RadioButtonGroup
          defaultSelected="No"
          orientation="vertical"
          onChange={(event) => {
            setReminder(event.toString());
          }}
          name="appointment-reminder-radio-group">
          <RadioButton className={styles.radioButton} id="Yes" labelText="Yes" value="Yes" />
          <RadioButton className={styles.radioButton} id="No" labelText="No" value="No" />
        </RadioButtonGroup>
      </div>

      <TextArea
        id="appointmentComment"
        light
        value={appointmentComment}
        className={styles.inputContainer}
        labelText={t('appointmentNoteLabel', 'Write an additional note')}
        placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
        onChange={(event) => setAppointmentComment(event.target.value)}
      />

      {context === 'editing' ? (
        <TextArea
          id="reason"
          light
          value={reason}
          className={styles.inputContainer}
          labelText={t('reasonForChanges', 'Reason For Changes')}
          onChange={(event) => setReason(event.target.value)}
        />
      ) : null}

      <ButtonSet>
        <Button onClick={closeOverlay} className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button
          onClick={handleSubmit}
          className={styles.button}
          disabled={isSubmitting || isMissingRequirements}
          kind="primary"
          type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default AppointmentForm;
