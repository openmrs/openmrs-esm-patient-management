import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DummyDataInput, dummyFormValues } from './dummy-data-input.component';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

/**
 * Helper to render DummyDataInput component.
 */
function renderDummyDataInput(onSetValues?: (values: FormValues) => void) {
  let capturedValues: FormValues = initialFormValues;
  const handleSetValues =
    onSetValues ||
    ((values: FormValues) => {
      capturedValues = values;
    });

  const utils = render(<DummyDataInput setValues={handleSetValues} />);

  return {
    ...utils,
    getCapturedValues: () => capturedValues,
  };
}

describe('DummyDataInput component', () => {
  describe('Rendering', () => {
    it('renders the dummy data input button', () => {
      renderDummyDataInput();

      const button = screen.getByLabelText('Input Dummy Data') as HTMLButtonElement;
      expect(button).toBeInTheDocument();
      expect(button.type).toBe('button');
    });
  });

  describe('User interaction', () => {
    it('populates form values with dummy data when button is clicked', async () => {
      const user = userEvent.setup();
      const mockSetValues = jest.fn();
      renderDummyDataInput(mockSetValues);

      const button = screen.getByLabelText('Input Dummy Data');
      await user.click(button);

      expect(mockSetValues).toHaveBeenCalledTimes(1);
      expect(mockSetValues).toHaveBeenCalledWith(dummyFormValues);
    });

    it('can be clicked multiple times', async () => {
      const user = userEvent.setup();
      const mockSetValues = jest.fn();
      renderDummyDataInput(mockSetValues);

      const button = screen.getByLabelText('Input Dummy Data');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockSetValues).toHaveBeenCalledTimes(3);
      expect(mockSetValues).toHaveBeenCalledWith(dummyFormValues);
    });
  });
});
