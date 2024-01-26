import { useEffect, useState, useCallback } from 'react';
import { type SearchedPatient } from '../types';

const useArrowNavigation = (
  totalResults: number,
  enterCallback: (evt: React.MouseEvent<HTMLAnchorElement>, index: number, patients?: Array<SearchedPatient>) => void,
  resetFocusCallback: () => void,
  initalFocusedResult: number = -1,
) => {
  const [focusedResult, setFocusedResult] = useState(initalFocusedResult);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'ArrowUp') {
        const newFocusedResult = Math.max(-1, focusedResult - 1);
        setFocusedResult(newFocusedResult);
        if (newFocusedResult === -1) {
          resetFocusCallback();
        }
      } else if (e.key === 'ArrowDown') {
        setFocusedResult((prev) => Math.min(totalResults - 1, prev + 1));
      } else if (e.key === 'Enter' && focusedResult > -1) {
        enterCallback(e, focusedResult);
      } else if (focusedResult !== -1) {
        // This condition will be met when scrolling through the list, the user presses another
        // key, then the user should be focussed to the input.
        // The focus to input should only be called when the user is scrolling through the list
        // Hence the if condition
        resetFocusCallback();
        setFocusedResult(initalFocusedResult);
      }
    },
    [setFocusedResult, totalResults, focusedResult, enterCallback, initalFocusedResult, resetFocusCallback],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return focusedResult;
};

export default useArrowNavigation;
