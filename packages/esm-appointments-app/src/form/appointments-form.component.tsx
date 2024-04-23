import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
  MultiSelect,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TimePicker,
  TimePickerSelect,
  Toggle,
} from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ResponsiveWrapper,
  showSnackbar,
  translateFrom,
  useConfig,
  useLayoutType,
  useLocations,
  useSession,
} from '@openmrs/esm-framework';
import {
  saveAppointment,
  saveRecurringAppointments,
  useAppointmentService,
  useMutateAppointments,
} from './appointments-form.resource';
import { useProviders } from '../hooks/useProviders';
import Workload from '../workload/workload.component';
import type { Appointment, AppointmentPayload, RecurringPattern } from '../types';
import { type ConfigObject } from '../config-schema';
import {
  appointmentLocationTagName,
  dateFormat,
  datePickerFormat,
  datePickerPlaceHolder,
  weekDays,
} from '../constants';
import styles from './appointments-form.scss';
import SelectedDateContext from '../hooks/selectedDateContext';
import { moduleName } from '../constants';

const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';
function isValidTime(timeStr) {
  return timeStr.match(new RegExp(time12HourFormatRegexPattern));
}

const appointmentsFormSchema = z
  .object({
    duration: z.number().refine((duration) => duration > 0, {
      message: translateFrom(moduleName, 'durationErrorMessage', 'Duration should be greater than zero'),
    }),
    location: z.string().refine((value) => value !== ''),
    provider: z.string().refine((value) => value !== ''),
    appointmentStatus: z.string().optional(),
    appointmentNote: z.string(),
    appointmentType: z.string().refine((value) => value !== ''),
    selectedService: z.string().refine((value) => value !== ''),
    recurringPatternType: z.enum(['DAY', 'WEEK']),
    recurringPatternPeriod: z.number(),
    recurringPatternDaysOfWeek: z.array(z.string()),
    selectedDaysOfWeekText: z.string().optional(),
    startTime: z.string().refine((value) => isValidTime(value)),
    timeFormat: z.enum(['AM', 'PM']),
    appointmentDateTime: z.object({
      startDate: z.date(),
      startDateText: z.string(),
      recurringPatternEndDate: z.date().nullable(),
      recurringPatternEndDateText: z.string().nullable(),
    }),
    formIsRecurringAppointment: z.boolean(),
  })
  .refine(
    (formValues) => {
      if (formValues.formIsRecurringAppointment === true) {
        return z.date().safeParse(formValues.appointmentDateTime.recurringPatternEndDate).success;
      }
      return true;
    },
    {
      path: ['appointmentDateTime[]'],
      message: 'A recurring appointment should have an end date',
    },
  );

type AppointmentFormData = z.infer<typeof appointmentsFormSchema>;

interface AppointmentsFormProps {
  appointment?: Appointment;
  recurringPattern?: RecurringPattern;
  patientUuid?: string;
  context: string;
  closeWorkspace: () => void;
}

const AppointmentsForm: React.FC<AppointmentsFormProps> = ({
  appointment,
  recurringPattern,
  patientUuid,
  context,
  closeWorkspace,
}) => {
  const { mutateAppointments } = useMutateAppointments();
  const editedAppointmentTimeFormat = new Date(appointment?.startDateTime).getHours() >= 12 ? 'PM' : 'AM';
  const defaultTimeFormat = appointment?.startDateTime
    ? editedAppointmentTimeFormat
    : new Date().getHours() >= 12
      ? 'PM'
      : 'AM';
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations(appointmentLocationTagName);
  const providers = useProviders();
  const session = useSession();
  const { selectedDate } = useContext(SelectedDateContext);
  const { data: services, isLoading } = useAppointmentService();
  const { appointmentStatuses, appointmentTypes, allowAllDayAppointments } = useConfig<ConfigObject>();

  const [isRecurringAppointment, setIsRecurringAppointment] = useState(false);
  const [isAllDayAppointment, setIsAllDayAppointment] = useState(false);

  const defaultRecurringPatternType = recurringPattern?.type || 'DAY';
  const defaultRecurringPatternPeriod = recurringPattern?.period || 1;
  const defaultRecurringPatternDaysOfWeek = recurringPattern?.daysOfWeek || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO can we clean this all up to be more consistent between using Date and dayjs?
  const defaultStartDate = appointment?.startDateTime
    ? new Date(appointment?.startDateTime)
    : selectedDate
      ? new Date(selectedDate)
      : new Date();
  const defaultEndDate = recurringPattern?.endDate ? new Date(recurringPattern?.endDate) : null;
  const defaultEndDateText = recurringPattern?.endDate
    ? dayjs(new Date(recurringPattern.endDate)).format(dateFormat)
    : '';
  const defaultStartDateText = appointment?.startDateTime
    ? dayjs(new Date(appointment.startDateTime)).format(dateFormat)
    : selectedDate
      ? dayjs(selectedDate).format(dateFormat)
      : dayjs(new Date()).format(dateFormat);

  const defaultAppointmentStartTime = appointment?.startDateTime
    ? dayjs(new Date(appointment?.startDateTime)).format('hh:mm')
    : dayjs(new Date()).format('hh:mm');

  const defaultDuration =
    appointment?.startDateTime && appointment?.endDateTime
      ? dayjs(appointment.endDateTime).diff(dayjs(appointment.startDateTime), 'minutes')
      : null;

  const { control, getValues, setValue, watch, handleSubmit } = useForm<AppointmentFormData>({
    mode: 'all',
    resolver: zodResolver(appointmentsFormSchema),
    defaultValues: {
      location: appointment?.location?.uuid ?? session?.sessionLocation?.uuid ?? '',
      provider:
        appointment?.providers?.find((provider) => provider.response === 'ACCEPTED')?.uuid ??
        session?.currentProvider?.uuid ??
        '', // assumes only a single previously-scheduled provider with state "ACCEPTED", if multiple, just takes the first
      appointmentNote: appointment?.comments || '',
      appointmentStatus: appointment?.status || '',
      appointmentType: appointment?.appointmentKind || '',
      selectedService: appointment?.service?.name || '',
      recurringPatternType: defaultRecurringPatternType,
      recurringPatternPeriod: defaultRecurringPatternPeriod,
      recurringPatternDaysOfWeek: defaultRecurringPatternDaysOfWeek,
      startTime: defaultAppointmentStartTime,
      duration: defaultDuration,
      timeFormat: defaultTimeFormat,
      appointmentDateTime: {
        startDate: defaultStartDate,
        startDateText: defaultStartDateText,
        recurringPatternEndDate: defaultEndDate,
        recurringPatternEndDateText: defaultEndDateText,
      },
      formIsRecurringAppointment: isRecurringAppointment,
    },
  });

  useEffect(() => setValue('formIsRecurringAppointment', isRecurringAppointment), [isRecurringAppointment]);

  const handleWorkloadDateChange = (date: Date) => {
    const appointmentDate = getValues('appointmentDateTime');
    setValue('appointmentDateTime', { ...appointmentDate, startDate: date });
  };

  const handleMultiselectChange = (e) => {
    setValue(
      'selectedDaysOfWeekText',
      (() => {
        if (e?.selectedItems?.length < 1) {
          return t('daysOfWeek', 'Days of the week');
        } else {
          return e.selectedItems
            .map((weekDay) => {
              return weekDay.label;
            })
            .join(', ');
        }
      })(),
    );
    setValue(
      'recurringPatternDaysOfWeek',
      e.selectedItems.map((s) => {
        return s.id;
      }),
    );
  };

  const defaultSelectedDaysOfWeekText: string = (() => {
    if (getValues('recurringPatternDaysOfWeek')?.length < 1) {
      return t('daysOfWeek', 'Days of the week');
    } else {
      return weekDays
        .filter((weekDay) => getValues('recurringPatternDaysOfWeek').includes(weekDay.id))
        .map((weekDay) => {
          return weekDay.label;
        })
        .join(', ');
    }
  })();

  // Same for creating and editing
  const handleSaveAppointment = (data: AppointmentFormData) => {
    setIsSubmitting(true);
    // Construct appointment payload
    const appointmentPayload = constructAppointmentPayload(data);
    // Construct recurring pattern payload
    const recurringAppointmentPayload = {
      appointmentRequest: appointmentPayload,
      recurringPattern: constructRecurringPattern(data),
    };
    const abortController = new AbortController();
    (isRecurringAppointment
      ? saveRecurringAppointments(recurringAppointmentPayload, abortController)
      : saveAppointment(appointmentPayload, abortController)
    ).then(
      ({ status }) => {
        if (status === 200) {
          setIsSubmitting(false);
          closeWorkspace();
          mutateAppointments();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title:
              context === 'editing'
                ? t('appointmentEdited', 'Appointment edited')
                : t('appointmentScheduled', 'Appointment scheduled'),
          });
        }
        if (status === 204) {
          setIsSubmitting(false);
          showSnackbar({
            title:
              context === 'editing'
                ? t('appointmentEditError', 'Error editing appointment')
                : t('appointmentFormError', 'Error scheduling appointment'),
            kind: 'error',
            isLowContrast: false,
            subtitle: t('noContent', 'No Content'),
          });
        }
      },
      (error) => {
        setIsSubmitting(false);
        showSnackbar({
          title:
            context === 'editing'
              ? t('appointmentEditError', 'Error editing appointment')
              : t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  };

  const constructAppointmentPayload = (data: AppointmentFormData): AppointmentPayload => {
    const {
      selectedService,
      startTime,
      timeFormat,
      appointmentDateTime: { startDate },
      duration,
      appointmentType: selectedAppointmentType,
      location,
      provider,
      appointmentNote,
      appointmentStatus,
    } = data;

    const serviceUuid = services?.find((service) => service.name === selectedService)?.uuid;
    const hoursAndMinutes = startTime.split(':').map((item) => parseInt(item, 10));
    const hours = (hoursAndMinutes[0] % 12) + (timeFormat === 'PM' ? 12 : 0);
    const minutes = hoursAndMinutes[1];
    const startDatetime = startDate.setHours(hours, minutes);
    const endDatetime = dayjs(startDatetime).add(duration, 'minutes').toDate();

    return {
      appointmentKind: selectedAppointmentType,
      status: appointmentStatus,
      serviceUuid: serviceUuid,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      locationUuid: location,
      providers: [{ uuid: provider }],
      patientUuid: patientUuid,
      comments: appointmentNote,
      uuid: context === 'editing' ? appointment.uuid : undefined,
    };
  };

  const constructRecurringPattern = (data: AppointmentFormData): RecurringPattern => {
    const {
      appointmentDateTime: { recurringPatternEndDate },
      recurringPatternType,
      recurringPatternPeriod,
      recurringPatternDaysOfWeek,
    } = data;

    const [hours, minutes] = [23, 59];
    const endDate = recurringPatternEndDate?.setHours(hours, minutes);

    return {
      type: recurringPatternType,
      period: recurringPatternPeriod,
      endDate: endDate ? dayjs(endDate).format() : null,
      daysOfWeek: recurringPatternDaysOfWeek,
    };
  };

  const onError = (error) => console.error(error);

  if (isLoading)
    return (
      <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} role="progressbar" />
    );

  return (
    <Form onSubmit={handleSubmit(handleSaveAppointment, onError)}>
      <Stack gap={4}>
        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('location', 'Location')}</span>
          <ResponsiveWrapper>
            <Controller
              name="location"
              control={control}
              render={({ field: { onChange, value, onBlur, ref } }) => (
                <Select
                  id="location"
                  invalidText="Required"
                  labelText={t('selectLocation', 'Select a location')}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  ref={ref}>
                  <SelectItem text={t('chooseLocation', 'Choose a location')} value="" />
                  {locations?.length > 0 &&
                    locations.map((location) => (
                      <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                        {location.display}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </section>
        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('service', 'Service')}</span>
          <ResponsiveWrapper>
            <Controller
              name="selectedService"
              control={control}
              render={({ field: { onBlur, onChange, value, ref } }) => (
                <Select
                  id="service"
                  invalidText="Required"
                  labelText={t('selectService', 'Select a service')}
                  onChange={(event) => {
                    onChange(event);
                    setValue(
                      'duration',
                      services?.find((service) => service.name === event.target.value)?.durationMins,
                    );
                  }}
                  onBlur={onBlur}
                  value={value}
                  ref={ref}>
                  <SelectItem text={t('chooseService', 'Select service')} value="" />
                  {services?.length > 0 &&
                    services.map((service) => (
                      <SelectItem key={service.uuid} text={service.name} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('appointmentType_title', 'Appointment Type')}</span>
          <ResponsiveWrapper>
            <Controller
              name="appointmentType"
              control={control}
              render={({ field: { onBlur, onChange, value, ref } }) => (
                <Select
                  disabled={!appointmentTypes?.length}
                  id="appointmentType"
                  invalidText="Required"
                  labelText={t('selectAppointmentType', 'Select the type of appointment')}
                  onChange={onChange}
                  value={value}
                  ref={ref}
                  onBlur={onBlur}>
                  <SelectItem text={t('chooseAppointmentType', 'Choose appointment type')} value="" />
                  {appointmentTypes?.length > 0 &&
                    appointmentTypes.map((appointmentType, index) => (
                      <SelectItem key={index} text={appointmentType} value={appointmentType}>
                        {appointmentType}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('recurringAppointment', 'Recurring Appointment')}</span>
          <Toggle
            id="recurringToggle"
            labelB={t('yes', 'Yes')}
            labelA={t('no', 'No')}
            labelText={t('isRecurringAppointment', 'Is this a recurring appointment?')}
            onClick={() => setIsRecurringAppointment(!isRecurringAppointment)}
          />
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('dateTime', 'Date & Time')}</span>
          <div>
            {isRecurringAppointment && (
              <div className={styles.inputContainer}>
                {allowAllDayAppointments && (
                  <Toggle
                    id="allDayToggle"
                    labelB={t('yes', 'Yes')}
                    labelA={t('no', 'No')}
                    labelText={t('allDay', 'All day')}
                    onClick={() => setIsAllDayAppointment(!isAllDayAppointment)}
                    toggled={isAllDayAppointment}
                  />
                )}
                <ResponsiveWrapper>
                  <Controller
                    name="appointmentDateTime"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <ResponsiveWrapper>
                        <DatePicker
                          datePickerType="range"
                          dateFormat={datePickerFormat}
                          value={[value.startDate, value.recurringPatternEndDate]}
                          ref={ref}
                          onChange={([startDate, endDate]) => {
                            onChange({
                              startDate: new Date(startDate),
                              recurringPatternEndDate: new Date(endDate),
                              recurringPatternEndDateText: dayjs(new Date(endDate)).format(dateFormat),
                              startDateText: dayjs(new Date(startDate)).format(dateFormat),
                            });
                          }}>
                          <DatePickerInput
                            id="startDatePickerInput"
                            labelText={t('startDate', 'Start date')}
                            style={{ width: '100%' }}
                            value={watch('appointmentDateTime').startDateText}
                          />
                          <DatePickerInput
                            id="endDatePickerInput"
                            labelText={t('endDate', 'End date')}
                            style={{ width: '100%' }}
                            placeholder={datePickerPlaceHolder}
                            value={watch('appointmentDateTime').recurringPatternEndDateText}
                          />
                        </DatePicker>
                      </ResponsiveWrapper>
                    )}
                  />
                </ResponsiveWrapper>

                {!isAllDayAppointment && (
                  <TimeAndDuration isTablet={isTablet} control={control} services={services} watch={watch} t={t} />
                )}

                <ResponsiveWrapper>
                  <Controller
                    name="recurringPatternPeriod"
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <NumberInput
                        hideSteppers
                        id="repeatNumber"
                        min={1}
                        max={356}
                        label={t('repeatEvery', 'Repeat every')}
                        invalidText={t('invalidNumber', 'Number is not valid')}
                        size="md"
                        value={value}
                        onBlur={onBlur}
                        onChange={(e) => {
                          onChange(Number(e.target.value));
                        }}
                      />
                    )}
                  />
                </ResponsiveWrapper>

                <ResponsiveWrapper>
                  <Controller
                    name="recurringPatternType"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <RadioButtonGroup
                        legendText={t('period', 'Period')}
                        name="radio-button-group"
                        onChange={(type) => onChange(type)}
                        valueSelected={value}>
                        <RadioButton labelText={t('day', 'Day')} value="DAY" id="radioDay" />
                        <RadioButton labelText={t('week', 'Week')} value="WEEK" id="radioWeek" />
                      </RadioButtonGroup>
                    )}
                  />
                </ResponsiveWrapper>

                {watch('recurringPatternType') === 'WEEK' && (
                  <div>
                    <Controller
                      name="selectedDaysOfWeekText"
                      control={control}
                      defaultValue={defaultSelectedDaysOfWeekText}
                      render={({ field: { onChange } }) => (
                        <MultiSelect
                          className={styles.weekSelect}
                          label={getValues('selectedDaysOfWeekText')}
                          id="daysOfWeek"
                          items={weekDays}
                          itemToString={(item) => (item ? t(item.labelCode, item.label) : '')}
                          selectionFeedback="top-after-reopen"
                          sortItems={(items) => {
                            return items.sort((a, b) => a.order > b.order);
                          }}
                          initialSelectedItems={weekDays.filter((i) => {
                            return getValues('recurringPatternDaysOfWeek').includes(i.id);
                          })}
                          onChange={(e) => {
                            onChange(e);
                            handleMultiselectChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {!isRecurringAppointment && (
              <div className={styles.inputContainer}>
                {allowAllDayAppointments && (
                  <Toggle
                    id="allDayToggle"
                    labelB={t('yes', 'Yes')}
                    labelA={t('no', 'No')}
                    labelText={t('allDay', 'All day')}
                    onClick={() => setIsAllDayAppointment(!isAllDayAppointment)}
                    toggled={isAllDayAppointment}
                  />
                )}
                <ResponsiveWrapper>
                  <Controller
                    name="appointmentDateTime"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <DatePicker
                        datePickerType="single"
                        dateFormat={datePickerFormat}
                        value={value.startDate}
                        onChange={([date]) => {
                          if (date) {
                            onChange({ ...value, startDate: date });
                          }
                        }}>
                        <DatePickerInput
                          id="datePickerInput"
                          labelText={t('date', 'Date')}
                          style={{ width: '100%' }}
                          placeholder={datePickerPlaceHolder}
                          ref={ref}
                        />
                      </DatePicker>
                    )}
                  />
                </ResponsiveWrapper>

                {!isAllDayAppointment && (
                  <TimeAndDuration isTablet={isTablet} control={control} services={services} watch={watch} t={t} />
                )}
              </div>
            )}
          </div>
        </section>

        {getValues('selectedService') && (
          <section className={styles.formGroup}>
            <ResponsiveWrapper>
              <Workload
                selectedService={watch('selectedService')}
                appointmentDate={watch('appointmentDateTime').startDate}
                onWorkloadDateChange={handleWorkloadDateChange}
              />
            </ResponsiveWrapper>
          </section>
        )}

        {context !== 'creating' ? (
          <section className={styles.formGroup}>
            <span className={styles.heading}>{t('appointmentStatus', 'Appointment Status')}</span>
            <ResponsiveWrapper>
              <Controller
                name="appointmentStatus"
                control={control}
                render={({ field: { onBlur, onChange, value, ref } }) => (
                  <Select
                    id="appointmentStatus"
                    invalidText="Required"
                    labelText={t('selectAppointmentStatus', 'Select status')}
                    onChange={onChange}
                    value={value}
                    ref={ref}
                    onBlur={onBlur}>
                    <SelectItem text={t('selectAppointmentStatus', 'selectAppointmentStatus')} value="" />
                    {appointmentStatuses?.length > 0 &&
                      appointmentStatuses.map((appointmentStatus, index) => (
                        <SelectItem key={index} text={appointmentStatus} value={appointmentStatus}>
                          {appointmentStatus}
                        </SelectItem>
                      ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </section>
        ) : null}

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('provider', 'Provider')}</span>
          <ResponsiveWrapper>
            <Controller
              name="provider"
              control={control}
              render={({ field: { onChange, value, onBlur, ref } }) => (
                <Select
                  id="provider"
                  invalidText="Required"
                  labelText={t('selectProvider', 'Select a provider')}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  ref={ref}>
                  <SelectItem text={t('chooseProvider', 'Choose a provider')} value="" />
                  {providers?.providers?.length > 0 &&
                    providers?.providers?.map((provider) => (
                      <SelectItem key={provider.uuid} text={provider.display} value={provider.uuid}>
                        {provider.display}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </section>

        <section className={styles.formGroup}>
          <span className={styles.heading}>{t('note', 'Note')}</span>
          <ResponsiveWrapper>
            <Controller
              name="appointmentNote"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <TextArea
                  id="appointmentNote"
                  value={value}
                  labelText={t('appointmentNoteLabel', 'Write an additional note')}
                  placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
                  onChange={onChange}
                  onBlur={onBlur}
                  ref={ref}
                />
              )}
            />
          </ResponsiveWrapper>
        </section>
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

function TimeAndDuration({ isTablet, t, watch, control, services }) {
  const defaultDuration = services?.find((service) => service.name === watch('selectedService'))?.durationMins || null;

  return (
    <>
      <ResponsiveWrapper>
        <Controller
          name="startTime"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TimePicker
              id="time-picker"
              pattern={time12HourFormatRegexPattern}
              invalid={!isValidTime(value)}
              invalidText={t('invalidTime', 'Invalid time')}
              onChange={(event) => onChange(event.target.value)}
              value={value}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
              labelText={t('time', 'Time')}>
              <Controller
                name="timeFormat"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TimePickerSelect
                    id="time-picker-select-1"
                    onChange={(event) => onChange(event.target.value as 'AM' | 'PM')}
                    value={value}
                    aria-label={t('time', 'Time')}>
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                )}
              />
            </TimePicker>
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          name="duration"
          control={control}
          defaultValue={defaultDuration}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <NumberInput
              hideSteppers
              disableWheel
              id="duration"
              min={0}
              max={1440}
              label={t('durationInMinutes', 'Duration (minutes)')}
              invalidText={t('invalidNumber', 'Number is not valid')}
              size="md"
              onBlur={onBlur}
              onChange={(event) => onChange(Number(event.target.value))}
              value={value}
              ref={ref}
            />
          )}
        />
      </ResponsiveWrapper>
    </>
  );
}

export default AppointmentsForm;
