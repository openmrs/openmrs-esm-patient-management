import React from 'react';
import { SWRConfig } from 'swr';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

const swrWrapper = ({ children }) => {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map(),
      }}>
      {children}
    </SWRConfig>
  );
};

export const renderWithSwr = (ui, options?) => render(ui, { wrapper: swrWrapper, ...options });

export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [...screen.queryAllByRole(/progressbar/i)], {
    timeout: 4000,
  });
}
