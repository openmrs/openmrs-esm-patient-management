import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  TimePicker,
  TimePickerSelect,
  Toggle,
  SkeletonText,
  Tab,
  TabList,
  Tabs,
  TabPanel,
  TabPanels,
  TextArea,
  Layer,
} from '@carbon/react';
import {
  useLocations,
  ExtensionSlot,
  usePatient,
  useConfig,
  showNotification,
  showToast,
  ConfigObject,
  useSession,
} from '@openmrs/esm-framework';

import first from 'lodash-es/first';
import styles from './appointments-form.scss';
import { mutate } from 'swr';
import { useAppointmentDate, convertTime12to24 } from '../../../helpers';
import { closeOverlay } from '../../../hooks/useOverlay';
import { MappedAppointment, AppointmentPayload } from '../../../types';
import {
  useProviders,
  useServices,
  useAppointmentSummary,
  toAppointmentDateTime,
  saveAppointment,
} from '../forms.resource';
import { useInitialAppointmentFormValue, PatientAppointment } from '../useInitialFormValues';
import { useCalendarDistribution } from '../workload-helper';
import WorkloadCard from '../workload.component';
import { useDefaultLoginLocation } from '../../../hooks/useDefaultLocation';
import LocationSelectOption from '../../common-components/location-select-option.component';

interface AppointmentFormProps {
  appointment?: MappedAppointment;
  patientUuid?: string;
  context: string;
}
const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, patientUuid, context }) => {
  const { t } = useTranslation();
  const { appointmentTypes, appointmentStatuses, hiddenFormFields } = useConfig() as ConfigObject;
  const initialAppointmentFormValues = useInitialAppointmentFormValue(appointment, patientUuid);
  const [patientAppointment, setPatientAppointment] = useState<PatientAppointment>(initialAppointmentFormValues);
  const { patient, isLoading } = usePatient(patientUuid ?? patientAppointment.patientUuid);
  const locations = useLocations();
  const sessionUser = useSession();
  const { providers } = useProviders();
  const { services } = useServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const appointmentSummary = useAppointmentSummary(patientAppointment.visitDate, patientAppointment.serviceUuid);
  const [selectedTab, setSelectedTab] = useState(0);
  const calendarWorkload = useCalendarDistribution(
    patientAppointment.serviceUuid,
    selectedTab === 0 ? 'week' : 'month',
    patientAppointment.visitDate,
  );
  const { currentAppointmentDate } = useAppointmentDate();
  const [selectedLocation, setSelectedLocation] = useState('');
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();

  const appointmentService = services?.find(({ uuid }) => uuid === patientAppointment.serviceUuid);
  const today = dayjs().startOf('day').toDate();

  useEffect(() => {
    if (locations?.length && sessionUser) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    } else if (!loadingDefaultFacility && defaultFacility) {
      setSelectedLocation(defaultFacility?.uuid);
    }
  }, [locations, sessionUser, loadingDefaultFacility]);

  const handleSubmit = async () => {
    const [startHour, startMinutes] = convertTime12to24(
      patientAppointment.startDateTime,
      patientAppointment.timeFormat,
    );
    const [endHour, endMinutes] = convertTime12to24(patientAppointment.endDateTime, patientAppointment.timeFormat);
    const startDatetime = toAppointmentDateTime(patientAppointment.visitDate, startHour, startMinutes);
    const endDatetime = toAppointmentDateTime(patientAppointment.visitDate, endHour, endMinutes);
    const appointmentPayload: AppointmentPayload = {
      appointmentKind: patientAppointment.appointmentKind,
      status: patientAppointment.status,
      serviceUuid: patientAppointment.serviceUuid,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      providerUuid: patientAppointment.providerUuid,
      providers: [{ uuid: patientAppointment.providerUuid }],
      comments: patientAppointment.comments,
      locationUuid: patientAppointment.locationUuid,
      patientUuid: patientAppointment.patientUuid,
      appointmentNumber: patientAppointment.appointmentNumber,
      uuid: patientAppointment.uuid,
    };

    const abortController = new AbortController();
    setIsSubmitting(true);
    saveAppointment(appointmentPayload).then(
      ({ status }) => {
        if (status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
          setIsSubmitting(false);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${currentAppointmentDate}&status=Scheduled`);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${currentAppointmentDate}&status=CheckedIn`);
          mutate(`/ws/rest/v1/appointment/all?forDate=${currentAppointmentDate}`);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?status=Scheduled&forDate=${currentAppointmentDate}`);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?status=Pending&forDate=${currentAppointmentDate}`);
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
            name="patient-header-slot"
            state={{
              patient,
              patientUuid: patientAppointment.patientUuid,
            }}
          />
        </div>
      )}

      <p>{t('selectAppointmentLocation', 'Select where the appointment will take place')}</p>

      <Select
        labelText={t('selectALocation', 'Select a location')}
        id="location"
        invalidText="Required"
        value={selectedLocation}
        defaultSelected={selectedLocation}
        onChange={(event) => setSelectedLocation(event.target.value)}>
        <LocationSelectOption
          selectedLocation={selectedLocation}
          defaultFacility={defaultFacility}
          locations={locations}
        />
      </Select>

      <Select
        id="service"
        invalidText="Required"
        labelText={t('selectService', 'Select a service')}
        className={styles.inputContainer}
        onChange={(event) => setPatientAppointment({ ...patientAppointment, serviceUuid: event.target.value })}
        value={patientAppointment.serviceUuid}>
        {!patientAppointment.serviceUuid || patientAppointment.serviceUuid == '--' ? (
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
        <Toggle
          onToggle={(value) => setPatientAppointment({ ...patientAppointment, isFullDay: value })}
          id="allDay"
          labelA="Off"
          labelB="On"
          labelText="All Day"
          defaultToggled={patientAppointment.isFullDay}
        />
        <DatePicker
          dateFormat="d/m/Y"
          datePickerType="single"
          id="visitDate"
          minDate={today}
          className={styles.datePickerInput}
          onChange={([date]) => setPatientAppointment({ ...patientAppointment, visitDate: date })}
          value={patientAppointment.visitDate}>
          <DatePickerInput
            id="visitStartDateInput"
            labelText={t('date', 'Date')}
            placeholder="dd/mm/yyyy"
            style={{ width: '100%' }}
          />
        </DatePicker>
      </div>
      {!patientAppointment.isFullDay ? (
        <div className={styles.row}>
          <TimePicker
            className={styles.timePickerInput}
            pattern="([\d]+:[\d]{2})"
            onChange={(event) => setPatientAppointment({ ...patientAppointment, startDateTime: event.target.value })}
            value={patientAppointment.startDateTime}
            labelText={t('startTime', 'Start Time')}
            id="start-time-picker">
            <TimePickerSelect
              id="start-time-picker"
              onChange={(event) => setPatientAppointment({ ...patientAppointment, timeFormat: event.target.value })}
              value={patientAppointment.timeFormat}
              labelText={t('time', 'Time')}
              aria-label={t('time', 'Time')}>
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
            </TimePickerSelect>
          </TimePicker>

          <TimePicker
            className={styles.timePickerInput}
            pattern="([\d]+:[\d]{2})"
            onChange={(event) => setPatientAppointment({ ...patientAppointment, endDateTime: event.target.value })}
            value={patientAppointment.endDateTime}
            labelText={t('endTime', 'End Time')}
            id="end-time-picker">
            <TimePickerSelect
              id="end-time-picker"
              onChange={(event) => setPatientAppointment({ ...patientAppointment, timeFormat: event.target.value })}
              value={patientAppointment.timeFormat}
              labelText={t('time', 'Time')}
              aria-label={t('time', 'Time')}>
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
            </TimePickerSelect>
          </TimePicker>
        </div>
      ) : null}

      {patientAppointment.serviceUuid && (
        <div className={styles.workLoadContainer}>
          <>
            <p className={styles.workLoadTitle}>
              {t(
                'serviceWorkloadTitle',
                `${appointmentService?.name} clinic work load on the week of ${dayjs(
                  first(appointmentSummary)?.date ?? new Date(),
                ).format('DD/MM')}`,
              )}
            </p>
            <Tabs
              selectedIndex={selectedTab}
              onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
              className={styles.tabs}>
              <TabList style={{ paddingLeft: '1rem' }}>
                <Tab>{t('weekly', 'Weekly')}</Tab>
                <Tab>{t('monthly', 'Monthly')}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel style={{ padding: 0 }}>
                  <div className={styles.workLoadCard}>
                    {calendarWorkload?.map(({ date, count }, index) => {
                      return (
                        <WorkloadCard
                          onClick={() => setPatientAppointment({ ...patientAppointment, visitDate: new Date(date) })}
                          key={`${date}-${index}`}
                          date={dayjs(date).format('DD/MM')}
                          count={count}
                          isActive={
                            dayjs(date).format('DD-MM-YYYY') ===
                            dayjs(patientAppointment.visitDate).format('DD-MM-YYYY')
                          }
                        />
                      );
                    })}
                  </div>
                </TabPanel>
                <TabPanel style={{ padding: 0 }}>
                  <div className={styles.monthlyWorkLoadCard}>
                    {calendarWorkload?.map(({ date, count }) => {
                      return (
                        <WorkloadCard
                          onClick={() => setPatientAppointment({ ...patientAppointment, visitDate: new Date(date) })}
                          key={date}
                          date={dayjs(date).format('DD/MM')}
                          count={count}
                          isActive={
                            dayjs(date).format('DD-MM-YYYY') ===
                            dayjs(patientAppointment.visitDate).format('DD-MM-YYYY')
                          }
                        />
                      );
                    })}
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        </div>
      )}

      <Select
        id="appointmentType"
        invalidText="Required"
        labelText={t('selectAppointmentType', 'Select an appointment type')}
        className={styles.inputContainer}
        onChange={(event) => setPatientAppointment({ ...patientAppointment, appointmentKind: event.target.value })}
        value={patientAppointment.appointmentKind}>
        {!patientAppointment.appointmentKind || patientAppointment.appointmentKind == '--' ? (
          <SelectItem text={t('selectAppointmentType', 'Select an appointment type')} value="" />
        ) : null}
        {appointmentTypes?.length > 0 &&
          appointmentTypes.map((service) => (
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
          className={styles.inputContainer}
          onChange={(event) => setPatientAppointment({ ...patientAppointment, status: event.target.value })}
          value={patientAppointment.status}>
          {!patientAppointment.status || patientAppointment.status == '--' ? (
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
        className={`${styles.inputContainer} ${hiddenFormFields.includes('providers') && styles.hide}`}
        onChange={(event) => {
          setPatientAppointment({ ...patientAppointment, providerUuid: event.target.value });
        }}
        value={patientAppointment.providerUuid}>
        {!patientAppointment.providerUuid ? (
          <SelectItem text={t('chooseProvider', 'Select Provider')} value="" />
        ) : null}
        {providers?.length > 0 &&
          providers.map((provider) => (
            <SelectItem key={provider.uuid} text={provider.display} value={provider.uuid}>
              {provider.display}
            </SelectItem>
          ))}
      </Select>

      {/*      <div className={styles.inputContainer} id="radio-group">
        <label className="cds--label">
          {t('getAppointmentReminder', 'Would you like to get a reminder about this appointment?')}
        </label>
        <RadioButtonGroup
          defaultSelected="No"
          orientation="vertical"
          onChange={(event) => {}}
          name="appointment-reminder-radio-group">
          <RadioButton className={styles.radioButton} id="Yes" labelText="Yes" value="Yes" />
          <RadioButton className={styles.radioButton} id="No" labelText="No" value="No" />
        </RadioButtonGroup>
      </div>*/}

      <Layer style={{ margin: '0.25rem 0' }}>
        <TextArea
          cols={50}
          id="comment"
          invalidText="A valid value is required"
          labelText={t('comment', 'Comment')}
          placeholder={t('typeInComments', 'Type in appointment comment')}
          rows={4}
          value={patientAppointment.comments}
          onChange={(event) => setPatientAppointment({ ...patientAppointment, comments: event.target.value })}
        />
      </Layer>

      <ButtonSet>
        <Button onClick={closeOverlay} className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button
          onClick={handleSubmit}
          className={styles.button}
          disabled={isSubmitting || !patientAppointment.serviceUuid}
          kind="primary"
          type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default AppointmentForm;
