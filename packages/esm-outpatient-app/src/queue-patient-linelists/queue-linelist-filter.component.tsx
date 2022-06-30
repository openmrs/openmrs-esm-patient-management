import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DatePicker,
  DatePickerInput,
  Form,
  Grid,
  Row,
  RadioButtonGroup,
  RadioButton,
  Dropdown,
  Column,
  Button,
  ButtonSet,
  NumberInput,
  ToggleSmall,
} from 'carbon-components-react';
import { filterType } from '../types/index';
import { mockVisitTypes } from '../../__mocks__/visits.mock';
import dayjs from 'dayjs';
import { toDateObjectStrict, toOmrsIsoString, useLayoutType } from '@openmrs/esm-framework';
import styles from './queue-linelist-filter.scss';

interface QueueLinelistFilterProps {
  toggleFilter: (filterMode: filterType) => void;
  closePanel: () => void;
}

const QueueLinelistFilter: React.FC<QueueLinelistFilterProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const [gender, setGender] = useState('');
  const [startAge, setStartAge] = useState(0);
  const [endAge, setEndAge] = useState(50);
  const [returnDate, setReturnDate] = useState(new Date());
  const [visitType, setVisitType] = useState('');
  const isTablet = useLayoutType() === 'tablet';

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
        <Grid className={styles.grid}>
          <Row className={styles.row}>
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
          </Row>

          <Row className={styles.row}>
            <Column>
              <p className={styles.heading}> {t('age', 'Age')}</p>
              <ToggleSmall aria-label={t('age', 'Age')} defaultToggled id="age" labelA="Off" labelB="On" labelText="" />

              <NumberInput
                id="startAge"
                light
                invalidText="Start age range is not valid"
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
                invalidText="End age range is not valid"
                label={t('end', 'End')}
                max={100}
                min={0}
                onChange={(event) => setEndAge(event.target.value)}
                size="md"
                value={endAge}
              />
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column>
              <p className={styles.heading}> {t('returnDate', 'Return Date')}</p>
              <DatePicker datePickerType="single" value={returnDate} onChange={([date]) => setReturnDate(date)} light>
                <DatePickerInput id="returnDate" placeholder="mm/dd/yyyy" labelText={t('date', 'Date')} type="date" />
              </DatePicker>
              <Button
                kind="ghost"
                onClick={() => {
                  handleTodaysDate();
                }}>
                {t('useTodaysDate', 'Use todays date')}
              </Button>
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column>
              <p className={styles.heading}>{t('visitType', 'Visit Type')}</p>
              <Dropdown
                id="visitType"
                light
                label="Select visit type"
                items={mockVisitTypes}
                onChange={(event) => setVisitType(event.selectedItem.toString)}
                size="sm"
                itemToElement={(item) => (item ? <span>{item.display}</span> : null)}
              />
            </Column>
          </Row>
        </Grid>

        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={closePanel}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit">
            {t('applyFilters', 'Apply Filters')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  );
};

export default QueueLinelistFilter;
