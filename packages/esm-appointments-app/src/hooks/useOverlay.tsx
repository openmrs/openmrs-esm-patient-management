import { getGlobalStore } from '@openmrs/esm-framework';
import { useCallback, useEffect, useState } from 'react';

export interface OverlayStore {
  isOverlayOpen: boolean;
  component?: any;
  header: string;
}

const initialState: OverlayStore = { isOverlayOpen: false, header: '' };

const getOverlayStore = () => {
  return getGlobalStore('appointment-store', initialState);
};

export const launchOverlay = (headerTitle: string, componentToRender: any) => {
  const store = getOverlayStore();
  store.setState({ isOverlayOpen: true, component: componentToRender, header: headerTitle });
};

export const closeOverlay = (): void => {
  const store = getOverlayStore();
  store.setState({ component: null, isOverlayOpen: false });
};

export const useOverlay = () => {
  const [overlay, setOverlay] = useState<OverlayStore>();

  const update = useCallback((state: OverlayStore) => {
    setOverlay(state);
  }, []);

  useEffect(() => {
    update(getOverlayStore().getState());
    getOverlayStore().subscribe(update);
  }, [update]);

  const { isOverlayOpen, component, header } = overlay ?? {};

  return {
    isOverlayOpen,
    component,
    header,
  };
};
