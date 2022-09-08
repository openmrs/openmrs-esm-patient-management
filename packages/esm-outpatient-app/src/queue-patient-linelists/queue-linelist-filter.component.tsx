import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DatePicker,
  DatePickerInput,
  Form,
  Layer,
  Stack,
  RadioButtonGroup,
  RadioButton,
  Dropdown,
  Column,
  Button,
  ButtonSet,
  NumberInput,
  Toggle,
} from '@carbon/react';
import dayjs from 'dayjs';
import { toDateObjectStrict, toOmrsIsoString, useLayoutType, useVisitTypes } from '@openmrs/esm-framework';
import styles from './queue-linelist-filter.scss';

interface QueueLinelistFilterProps {
  closePanel: () => void;
}

const QueueLinelistFilter: React.FC<QueueLinelistFilterProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const [gender, setGender] = useState('');
  const [startAge, setStartAge] = useState<number>();
  const [endAge, setEndAge] = useState<number>();
  const [returnDate, setReturnDate] = useState(new Date());
  const [visitType, setVisitType] = useState('');
  const isTablet = useLayoutType() === 'tablet';
  const allVisitTypes = useVisitTypes();

  const handleFilter = useCallback(
    (event) => {
      event.preventDefault();

      const payload = {
        gender: gender,
        startAge: startAge,
        endAge: endAge,
        returnDate: toDateObjectStrict(
          toOmrsIsoString(new Date(dayjs(returnDate).year(), dayjs(returnDate).month(), dayjs(returnDate).date())),
        ),
        visitType: visitType,
      };
    },
    [gender, startAge, endAge, returnDate, visitType],
  );

  const handleTodaysDate = () => {
    setReturnDate(new Date());
  };

  return (
    <>
      <Form onSubmit={handleFilter}>
        <div className={styles.wrapper}>
          <Stack gap={4} className={styles.grid}>
            <Column>
              <p className={styles.heading}> {t('gender', 'Gender')}</p>
              <RadioButtonGroup name="gender" orientation="vertical" onChange={(event) => setGender(event.toString())}>
                <RadioButton
                  className={styles.radioButton}
                  id="male"
                  labelText={t('maleLabelText', 'Male')}
                  value="Male"
                />
                <RadioButton
                  className={styles.radioButton}
                  id="female"
                  labelText={t('femaleLabelText', 'Female')}
                  value="Female"
                />
              </RadioButtonGroup>
            </Column>
          </Stack>

          <Stack gap={4} className={styles.grid}>
            <Column md={2}>
              <p className={styles.heading}> {t('age', 'Age')}</p>
              <Layer>
                <Toggle
                  size="sm"
                  aria-label={t('age', 'Age')}
                  defaultToggled
                  id="age"
                  labelA="Off"
                  labelB="On"
                  labelText=""
                />
              </Layer>
              <Layer className={styles.numberInputs}>
                <NumberInput
                  id="startAge"
                  light
                  invalidText={t('startAgeRangeInvalid', 'Start age range is not valid')}
                  label={t('between', 'Between')}
                  max={100}
                  min={0}
                  onChange={(event) => setStartAge(event.target.value)}
                  size="md"
                  value={startAge}
                />
                <NumberInput
                  id="endAge"
                  light
                  invalidText={t('endAgeRangeInvalid', 'End age range is not valid')}
                  label={t('and', 'And')}
                  max={100}
                  min={0}
                  onChange={(event) => setEndAge(event.target.value)}
                  size="md"
                  value={endAge}
                />
              </Layer>
            </Column>
          </Stack>

          <Stack gap={4} className={styles.grid}>
            <Column md={2}>
              <p className={styles.heading}> {t('returnDate', 'Return Date')}</p>
              <DatePicker datePickerType="single" value={returnDate} onChange={([date]) => setReturnDate(date)} light>
                <DatePickerInput id="returnDate" placeholder="mm/dd/yyyy" labelText={t('date', 'Date')} type="date" />
              </DatePicker>
              <Button
                kind="ghost"
                onClick={() => {
                  handleTodaysDate();
                }}>
                {t('useTodaysDate', "Use today's date")}
              </Button>
            </Column>
          </Stack>

          <Stack gap={4} className={styles.grid}>
            <Column>
              <p className={styles.heading}>{t('visitType', 'Visit Type')}</p>
              <Dropdown
                id="visitType"
                light
                label={t('selectVisitTyoe', 'Select visit type')}
                items={allVisitTypes}
                onChange={(event) => setVisitType(event.selectedItem.toString)}
                size="sm"
                itemToElement={(item) => (item ? <span>{item.display}</span> : null)}
              />
            </Column>
          </Stack>
        </div>

        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={closePanel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit">
            {t('applyFilters', 'Apply filters')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  );
};

export default QueueLinelistFilter;
