import { AdvancedPatientSearchActionTypes, type AdvancedPatientSearchState } from '../types';

export const initialState: AdvancedPatientSearchState = {
  gender: 'any',
  dateOfBirth: 0,
  monthOfBirth: 0,
  yearOfBirth: 0,
  postcode: '',
  age: 0,
  attributes: {},
};

interface Action {
  type: number;
  [key: string]: any;
}

const isPersonAttributeField = (fieldName: string) => !['gender', 'dateOfBirth', 'postcode', 'age'].includes(fieldName);

const reducer = (state: AdvancedPatientSearchState, action: Action): AdvancedPatientSearchState => {
  switch (action.type) {
    case AdvancedPatientSearchActionTypes.SET_FIELD:
      if (!action.field) return state;

      if (isPersonAttributeField(action.field)) {
        return {
          ...state,
          attributes: {
            ...state.attributes,
            [action.field]: action.value,
          },
        };
      }

      return {
        ...state,
        [action.field]: action.value,
      };
    case AdvancedPatientSearchActionTypes.SET_DATE_OF_BIRTH:
      return {
        ...state,
        dateOfBirth: action.dateOfBirth,
      };
    case AdvancedPatientSearchActionTypes.SET_MONTH_OF_BIRTH:
      return {
        ...state,
        monthOfBirth: action.monthOfBirth,
      };
    case AdvancedPatientSearchActionTypes.SET_YEAR_OF_BIRTH:
      return {
        ...state,
        yearOfBirth: action.yearOfBirth,
      };
    case AdvancedPatientSearchActionTypes.RESET_FIELDS:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
