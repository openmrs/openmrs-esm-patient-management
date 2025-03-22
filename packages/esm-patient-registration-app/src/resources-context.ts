import { createContext, useContext } from 'react';
import { type Resources } from './offline.resources';

export const ResourcesContext = createContext<Resources>(null);

export const ResourcesContextProvider = ResourcesContext.Provider;

export const useResourcesContext = () => {
  const resources = useContext(ResourcesContext);
  if (!resources) {
    throw new Error('useResourcesContext must be used within a ResourcesContextProvider');
  }
  return resources;
};
