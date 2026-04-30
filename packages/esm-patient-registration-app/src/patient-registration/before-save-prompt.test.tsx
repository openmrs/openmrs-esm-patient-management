import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { showModal, navigate } from '@openmrs/esm-framework';
import BeforeSavePrompt from './before-save-prompt.component';

const mockShowModal = jest.mocked(showModal);
const mockNavigate = jest.mocked(navigate);

const mockGetOpenmrsSpaBase = jest.fn(() => '/openmrs/spa');
window['getOpenmrsSpaBase'] = mockGetOpenmrsSpaBase;

/**
 * Helper to render BeforeSavePrompt component.
 */
function renderBeforeSavePrompt(when: boolean, redirect?: string) {
  return render(<BeforeSavePrompt when={when} redirect={redirect} />);
}

describe('BeforeSavePrompt component', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  let disposeMock: jest.Mock;

  beforeEach(() => {
    disposeMock = jest.fn();
    mockShowModal.mockReturnValue(disposeMock);
    mockNavigate.mockClear();

    // Spy on window.addEventListener and removeEventListener
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe('Event listener setup', () => {
    it('does not set up event listeners when when is false', () => {
      renderBeforeSavePrompt(false);

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('sets up beforeunload and navigation event listeners when when is true', () => {
      renderBeforeSavePrompt(true);

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('single-spa:before-routing-event', expect.any(Function));
    });

    it('removes event listeners on unmount', () => {
      const { unmount } = renderBeforeSavePrompt(true);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('single-spa:before-routing-event', expect.any(Function));
    });

    it('does not set up listeners when redirect is provided', () => {
      renderBeforeSavePrompt(true, '/some/path');

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('Beforeunload event handling', () => {
    it('prevents default and sets returnValue on beforeunload event', () => {
      renderBeforeSavePrompt(true);

      const beforeunloadHandler = addEventListenerSpy.mock.calls.find((call) => call[0] === 'beforeunload')?.[1] as (
        e: BeforeUnloadEvent,
      ) => string;

      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      const result = beforeunloadHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBeTruthy();
      expect(result).toBeTruthy();
    });
  });

  describe('Navigation event handling', () => {
    it('shows modal and cancels navigation on single-spa routing event', () => {
      renderBeforeSavePrompt(true);

      const navigationHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'single-spa:before-routing-event',
      )?.[1] as (e: CustomEvent) => void;

      const mockCancelNavigation = jest.fn();
      const mockEvent = {
        detail: {
          newUrl: '/openmrs/spa/new-page',
          navigationIsCanceled: false,
          cancelNavigation: mockCancelNavigation,
        },
      } as unknown as CustomEvent;

      navigationHandler(mockEvent);

      expect(mockCancelNavigation).toHaveBeenCalled();
      expect(mockShowModal).toHaveBeenCalledWith(
        'cancel-patient-edit-modal',
        expect.objectContaining({
          onConfirm: expect.any(Function),
        }),
        expect.any(Function),
      );
    });

    it('does not show modal if navigation is already canceled', () => {
      renderBeforeSavePrompt(true);

      const navigationHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'single-spa:before-routing-event',
      )?.[1] as (e: CustomEvent) => void;

      const mockEvent = {
        detail: {
          newUrl: '/openmrs/spa/new-page',
          navigationIsCanceled: true,
          cancelNavigation: jest.fn(),
        },
      } as unknown as CustomEvent;

      navigationHandler(mockEvent);

      expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('navigates to target URL when modal is confirmed', async () => {
      renderBeforeSavePrompt(true);

      const navigationHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'single-spa:before-routing-event',
      )?.[1] as (e: CustomEvent) => void;

      const mockEvent = {
        detail: {
          newUrl: '/openmrs/spa/new-page',
          navigationIsCanceled: false,
          cancelNavigation: jest.fn(),
        },
      } as unknown as CustomEvent;

      // Call navigationHandler directly - it triggers showModal synchronously
      navigationHandler(mockEvent);

      // Get the onConfirm callback from showModal call
      // showModal is called with: (modalName, props, onClose)
      const modalProps = mockShowModal.mock.calls[0]?.[1] as { onConfirm?: () => void } | undefined;
      const onConfirm = modalProps?.onConfirm;

      expect(onConfirm).toBeDefined();

      // Call onConfirm directly - waitFor will handle async updates
      onConfirm?.();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: expect.stringContaining('/new-page'),
        });
      });
      expect(disposeMock).toHaveBeenCalled();
    });
  });

  describe('Redirect handling', () => {
    it('navigates to redirect URL when redirect prop is provided', async () => {
      renderBeforeSavePrompt(true, '/openmrs/spa/target-page');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: expect.stringContaining('/target-page'),
        });
      });
    });

    it('handles redirect with full URL', async () => {
      mockGetOpenmrsSpaBase.mockReturnValue('/openmrs/spa');
      renderBeforeSavePrompt(true, '/openmrs/spa/target-page');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: expect.stringContaining('/target-page'),
        });
      });
    });
  });
});
