import { createContext, useContext } from 'react';

export const AddPatientToQueueContext = createContext({
  currentServiceQueueUuid: '',
});

export const AddPatientToQueueContextProvider = AddPatientToQueueContext.Provider;

export const useAddPatientToQueueContext = () => {
  const context = useContext(AddPatientToQueueContext);
  if (!context) {
    throw new Error('useAddPatientToQueueContext must be used within a AddPatientToQueueContextProvider');
  }
  return context;
};
