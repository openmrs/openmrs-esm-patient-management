import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import classNames from 'classnames';
import dayjs from 'dayjs';
import first from 'lodash-es/first';
import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
  Layer,
  Row,
  Select,
  SelectItem,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextArea,
  TimePicker,
  TimePickerSelect,
  Toggle,
} from '@carbon/react';
import {
  ExtensionSlot,
  showSnackbar,
  useConfig,
  useLayoutType,
  useLocations,
  usePatient,
  useSession,
} from '@openmrs/esm-framework';
import { useAppointmentDate, convertTime12to24 } from '../../../helpers';
import { closeOverlay } from '../../../hooks/useOverlay';
import { type MappedAppointment, type AppointmentPayload } from '../../../types';
import {
  saveAppointment,
  toAppointmentDateTime,
  useAppointmentSummary,
  useProviders,
  useServices,
} from '../forms.resource';
import { useAppointmentList } from '../../../hooks/useAppointmentList';
import { useCalendarDistribution } from '../workload-helper';
import { useDefaultLoginLocation } from '../../../hooks/useDefaultLocation';
import { useInitialAppointmentFormValue, type PatientAppointment } from '../useInitialFormValues';
import LocationSelectOption from '../../common-components/location-select-option.component';
import WorkloadCard from '../workload.component';
import styles from './appointments-form.scss';
import { appointmentLocationTagName } from '../../../constants';
import { type ConfigObject } from '../../../config-schema';

interface AppointmentFormProps {
  appointment?: MappedAppointment;
  patientUuid?: string;
  context: string;
}
const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, patientUuid, context }) => {
  const { t } = useTranslation();
  const { currentAppointmentDate } = useAppointmentDate();
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();
  const { providers } = useProviders();
  const { services } = useServices();
  const locations = useLocations(appointmentLocationTagName);
  const sessionUser = useSession();
  const isTablet = useLayoutType() === 'tablet';
  const initialAppointmentFormValues = useInitialAppointmentFormValue(appointment, patientUuid);
  const { appointmentTypes, appointmentStatuses, hiddenFormFields, allowAllDayAppointments } =
    useConfig<ConfigObject>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientAppointment, setPatientAppointment] = useState<PatientAppointment>(initialAppointmentFormValues);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const { mutate: mutateAppointmentSearch } = useAppointmentList(patientAppointment.status);

  const { patient, isLoading } = usePatient(patientUuid ?? patientAppointment.patientUuid);
  const appointmentSummary = useAppointmentSummary(patientAppointment.visitDate, patientAppointment.serviceUuid);
  const calendarWorkload = useCalendarDistribution(
    patientAppointment.serviceUuid,
    selectedTab === 0 ? 'week' : 'month',
    patientAppointment.visitDate,
  );

  const appointmentService = services?.find(({ uuid }) => uuid === patientAppointment.serviceUuid);
  const today = dayjs().startOf('day').format('DD/MM/YYYY');

  useEffect(() => {
    if (locations?.length && sessionUser) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    } else if (!loadingDefaultFacility && defaultFacility) {
      setSelectedLocation(defaultFacility?.uuid);
    }
  }, [locations, sessionUser, loadingDefaultFacility, defaultFacility]);

  const handleSubmit = useCallback(() => {
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

    setIsSubmitting(true);
    saveAppointment(appointmentPayload).then(
      ({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('appointmentNowVisible', 'It is now visible on the appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
          setIsSubmitting(false);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${currentAppointmentDate}&status=Scheduled`);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${currentAppointmentDate}&status=CheckedIn`);
          mutate(`/ws/rest/v1/appointment/all?forDate=${currentAppointmentDate}`);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?status=Scheduled&forDate=${currentAppointmentDate}`);
          mutate(`/ws/rest/v1/appointment/appointmentStatus?status=Pending&forDate=${currentAppointmentDate}`);
          mutateAppointmentSearch();
          closeOverlay();
        }
      },
      (error) => {
        showSnackbar({
          title: t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          subtitle: error?.message,
        });
        setIsSubmitting(false);
      },
    );
  }, [currentAppointmentDate, patientAppointment, t]);

  return (
    <Form className={styles.form} onClick={(e) => e.preventDefault()}>
      <section>
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} />
          </div>
        ) : (
          <div className={styles.stickyFormHeader}>
            <ExtensionSlot
              name="patient-header-slot"
              state={{
                patient,
                patientUuid: patientAppointment.patientUuid,
                hideActionsOverflow: false,
              }}
            />
          </div>
        )}

        <Stack className={styles.container} gap={1}>
          <Row className={styles.row}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('location', 'Location')}</span>
            </Column>
            <Column sm={3}>
              <Select
                labelText={t('selectALocation', 'Select a location')}
                id="location"
                invalidText="Required"
                value={selectedLocation}
                defaultValue={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}>
                <LocationSelectOption
                  selectedLocation={selectedLocation}
                  defaultFacility={defaultFacility}
                  locations={locations}
                />
              </Select>
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('service', 'Service')}</span>
            </Column>
            <Column sm={3}>
              <Select
                id="service"
                invalidText="Required"
                labelText={t('selectService', 'Select a service')}
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
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column>
              <span className={styles.columnLabel}>{t('dateAndTime', 'Date and time')}</span>
            </Column>
            <Column>
              <section className={styles.flexRow}>
                {allowAllDayAppointments && (
                  <Toggle
                    className={styles.flex1}
                    defaultToggled={patientAppointment.isFullDay}
                    id="allDay"
                    labelA={t('off', 'Off')}
                    labelB={t('on', 'On')}
                    labelText={t('allDay', 'All Day')}
                    onToggle={(value) => setPatientAppointment({ ...patientAppointment, isFullDay: value })}
                  />
                )}
                <DatePicker
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  id="visitDate"
                  minDate={today}
                  className={classNames(styles.datePickerInput, styles.flex1)}
                  onChange={([date]) => setPatientAppointment({ ...patientAppointment, visitDate: date })}
                  value={patientAppointment.visitDate}>
                  <DatePickerInput
                    className={styles.flex1}
                    id="visitStartDateInput"
                    labelText={t('date', 'Date')}
                    placeholder="dd/mm/yyyy"
                  />
                </DatePicker>
              </section>
            </Column>

            {!patientAppointment.isFullDay ? (
              <Column>
                <div className={styles.flexRow}>
                  <TimePicker
                    className={styles.timePickerInput}
                    pattern="([\d]+:[\d]{2})"
                    onChange={(event) =>
                      setPatientAppointment({ ...patientAppointment, startDateTime: event.target.value })
                    }
                    value={patientAppointment.startDateTime}
                    labelText={t('startTime', 'Start time')}
                    id="start-time-picker">
                    <TimePickerSelect
                      id="start-time-picker"
                      onChange={(event) =>
                        setPatientAppointment({ ...patientAppointment, timeFormat: event.target.value })
                      }
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
                    onChange={(event) =>
                      setPatientAppointment({ ...patientAppointment, endDateTime: event.target.value })
                    }
                    value={patientAppointment.endDateTime}
                    labelText={t('endTime', 'End time')}
                    id="end-time-picker">
                    <TimePickerSelect
                      id="end-time-picker"
                      onChange={(event) =>
                        setPatientAppointment({ ...patientAppointment, timeFormat: event.target.value })
                      }
                      value={patientAppointment.timeFormat}
                      labelText={t('time', 'Time')}
                      aria-label={t('time', 'Time')}>
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                </div>
              </Column>
            ) : null}

            {patientAppointment.serviceUuid && (
              <Column sm={3}>
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
                                  onClick={() =>
                                    setPatientAppointment({ ...patientAppointment, visitDate: new Date(date) })
                                  }
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
                                  onClick={() =>
                                    setPatientAppointment({ ...patientAppointment, visitDate: new Date(date) })
                                  }
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
              </Column>
            )}
          </Row>

          <Row className={styles.row}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('appointmentType', 'Appointment type')}</span>
            </Column>
            <Column sm={3}>
              <Select
                id="appointmentType"
                invalidText="Required"
                labelText={t('selectAppointmentType', 'Select an appointment type')}
                onChange={(event) =>
                  setPatientAppointment({ ...patientAppointment, appointmentKind: event.target.value })
                }
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
            </Column>
          </Row>

          {context !== 'creating' ? (
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>{t('appointmentStatus', 'Appointment status')}</span>
              </Column>
              <Column sm={3}>
                <Select
                  id="appointmentStatus"
                  invalidText="Required"
                  labelText={t('selectAppointmentStatus', 'Select status')}
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
              </Column>
            </Row>
          ) : null}

          <Row className={styles.row}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('provider', 'Provider')}</span>
            </Column>
            <Column sm={3}>
              <Select
                className={classNames(styles.inputContainer, {
                  [styles.hide]: hiddenFormFields.includes('providers'),
                })}
                id="providers"
                invalidText="Required"
                labelText={t('selectProvider', 'Select a provider')}
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
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column sm={1}>
              <span className={styles.columnLabel}>{t('comments', 'Comments')}</span>
            </Column>
            <Column>
              <ResponsiveWrapper isTablet={isTablet}>
                <TextArea
                  cols={50}
                  id="note"
                  invalidText="A valid value is required"
                  labelText={t('writeAdditionalComments', 'Write additional comments')}
                  placeholder={t('writeAdditionalComments', 'Write any additional comments here')}
                  rows={4}
                  value={patientAppointment.comments}
                  onChange={(event) => setPatientAppointment({ ...patientAppointment, comments: event.target.value })}
                />
              </ResponsiveWrapper>
            </Column>
          </Row>
        </Stack>
      </section>
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
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default AppointmentForm;
