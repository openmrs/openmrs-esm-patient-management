import { createContext, useContext } from 'react';
import type { AdmissionRequestsWorkspaceProps } from './admission-requests.workspace';

export const AdmissionRequestsWorkspaceContext = createContext<AdmissionRequestsWorkspaceProps>(null);

export const AdmissionRequestsWorkspaceContextProvider = AdmissionRequestsWorkspaceContext.Provider;

export const useAdmissionRequestsWorkspaceContext = () => {
  const context = useContext(AdmissionRequestsWorkspaceContext);
  if (!context) {
    throw new Error(
      'useAdmissionRequestsWorkspaceContext must be used within a AdmissionRequestsWorkspaceContextProvider',
    );
  }
  return context;
};
