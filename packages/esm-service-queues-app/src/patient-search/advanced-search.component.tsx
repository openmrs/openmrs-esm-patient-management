import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Column,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  Layer,
  Stack,
  Switch,
  TextInput,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { SearchTypes } from '../types';
import styles from './advanced-search.scss';

interface PatientSearchProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
}

enum fieldMatcherRange {
  ANY = 'any',
  ALL = 'all',
}

enum genders {
  ANY = 'any',
  MALE = 'male',
  FEMALE = 'female',
}

const AdvancedSearch: React.FC<PatientSearchProps> = ({ toggleSearchType }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [postCode, setPostCode] = useState('');
  const [lastVisitDate, setLastVisitDate] = useState('');
  const [fieldMatcherRangeSwitcherValue, setFieldMatcherRangeSwitcherValue] = useState(0);
  const [genderSwitcherValue, setGenderSwitcherValue] = useState(0);
  const [searchParams, setSearchParams] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    setSearchParams([firstName, middleName, lastName, gender, dateOfBirth, phoneNumber, postCode, lastVisitDate]);
  };

  return (
    <Form onSubmit={handleSearch} className={styles.form}>
      <div>
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowLeft size={24} {...props} />}
            iconDescription="Back to simple search"
            size="sm"
            onClick={() => toggleSearchType(SearchTypes.BASIC)}>
            <span>{t('backToSimpleSearch', 'Back to simple search')}</span>
          </Button>
        </div>
        <Stack gap={4} className={styles.grid}>
          <Column>
            <div className={styles.contentSwitcherContainer}>
              <span>{t('match', 'Match')}</span>
              <ContentSwitcher
                size="sm"
                className={styles.fieldRangeSwitcher}
                onChange={({ index }) => setFieldMatcherRangeSwitcherValue(index)}>
                <Switch name={fieldMatcherRange.ANY} text={t('any', 'Any')} />
                <Switch name={fieldMatcherRange.ALL} text={t('all', 'All')} />
              </ContentSwitcher>
              <span>{t('fields', 'of the following fields')}:</span>
            </div>
          </Column>

          <Column>
            <h3 className={styles.heading}>{t('name', 'Name')}</h3>
            <Layer>
              <TextInput
                className={styles.input}
                id="firstName"
                labelText={t('firstName', 'First name')}
                onChange={(event) => setFirstName(event.target.value)}
                value={firstName}
              />
            </Layer>
            <Layer>
              <TextInput
                className={styles.input}
                id="middleName"
                labelText={t('middleName', 'Middle name')}
                onChange={(event) => setMiddleName(event.target.value)}
                value={middleName}
              />
            </Layer>
            <Layer>
              <TextInput
                className={styles.input}
                id="lastName"
                labelText={t('lastName', 'Last name')}
                onChange={(event) => setLastName(event.target.value)}
                value={lastName}
              />
            </Layer>
          </Column>
          <span className={styles.spacer} />

          <Column>
            <h3 className={styles.heading}>{t('personalDetails', 'Personal details')}</h3>
            <FormGroup legendText={t('sex', 'Sex')}>
              <ContentSwitcher
                size="sm"
                className={styles.genderSwitcher}
                onChange={({ index }) => setGenderSwitcherValue(index)}>
                <Switch name={genders.ANY} text={t('any', 'Any')} />
                <Switch name={genders.MALE} text={t('male', 'Male')} />
                <Switch name={genders.FEMALE} text={t('female', 'Female')} />
              </ContentSwitcher>
            </FormGroup>
            <Layer>
              <DatePicker datePickerType="single">
                <DatePickerInput
                  id="dateOfBirth"
                  placeholder="mm/dd/yyyy"
                  labelText={t('dateOfBirth', 'Date of birth')}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  type="date"
                />
              </DatePicker>
            </Layer>
            <Layer>
              <TextInput
                className={styles.input}
                id="phoneNumber"
                labelText={t('phoneNumber', 'Phone number')}
                onChange={(event) => setPhoneNumber(event.target.value)}
                value={phoneNumber}
              />
            </Layer>
            <Layer>
              <TextInput
                className={styles.input}
                id="postCode"
                labelText={t('postCode', 'Post code')}
                onChange={(event) => setPostCode(event.target.value)}
                value={postCode}
              />
            </Layer>
          </Column>
          <span className={styles.spacer} />

          <Column>
            <h3 className={styles.heading}>{t('lastVisit', 'Last visit')}</h3>
            <Layer>
              <DatePicker datePickerType="single">
                <DatePickerInput
                  id="lastVisitDate"
                  placeholder="mm/dd/yyyy"
                  labelText={t('lastVisitDate', 'Date')}
                  onChange={(event) => setLastVisitDate(event.target.value)}
                  type="date"
                  width={'120px'}
                />
              </DatePicker>
            </Layer>
          </Column>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => toggleSearchType(SearchTypes.BASIC)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('search', 'Search')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AdvancedSearch;
