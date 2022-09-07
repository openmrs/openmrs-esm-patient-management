import { useReducer } from 'react';
import { AdvancedPatientSearchAction, AdvancedPatientSearchActionTypes, AdvancedPatientSearchState } from '../types';

export const initialState: AdvancedPatientSearchState = {
  gender: 'any',
  dateOfBirth: undefined,
  monthOfBirth: undefined,
  yearOfBirth: undefined,
  phoneNumber: undefined,
  postcode: undefined,
  dateOfVisit: '',
};

const reducer: (
  state: AdvancedPatientSearchState,
  action: AdvancedPatientSearchAction,
) => AdvancedPatientSearchState = (state, action) => {
  switch (action.type) {
    case AdvancedPatientSearchActionTypes.SET_GENDER:
      return {
        ...state,
        gender: action.gender,
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
    case AdvancedPatientSearchActionTypes.SET_PHONE_NUMBER:
      return {
        ...state,
        phoneNumber: action.phoneNumber,
      };
    case AdvancedPatientSearchActionTypes.SET_POSTCODE:
      return {
        ...state,
        postcode: action.postcode,
      };
    case AdvancedPatientSearchActionTypes.SET_DATE_OF_VISIT:
      return {
        ...state,
        dateOfVisit: action.dateOfVisit,
      };
    case AdvancedPatientSearchActionTypes.RESET_FIELDS:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
