import { useEffect, useState, useCallback } from 'react';
import { type SearchedPatient } from '../types';

const useArrowNavigation = (
  totalResults: number,
  enterCallback: (evt: React.MouseEvent<HTMLAnchorElement>, index: number, patients?: Array<SearchedPatient>) => void,
  resetFocusCallback: () => void,
  initalFocussedResult: number = -1,
) => {
  const [focussedResult, setFocussedResult] = useState(initalFocussedResult);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'ArrowUp') {
        const newFocussedResult = Math.max(-1, focussedResult - 1);
        setFocussedResult(newFocussedResult);
        if (newFocussedResult === -1) {
          resetFocusCallback();
        }
      } else if (e.key === 'ArrowDown') {
        setFocussedResult((prev) => Math.min(totalResults - 1, prev + 1));
      } else if (e.key === 'Enter' && focussedResult > -1) {
        enterCallback(e, focussedResult);
      } else if (focussedResult !== -1) {
        // This condition will be met when scrolling through the list, the user presses another
        // key, then the user should be focussed to the input.
        // The focus to input should only be called when the user is scrolling through the list
        // Hence the if condition
        resetFocusCallback();
        setFocussedResult(initalFocussedResult);
      }
    },
    [setFocussedResult, totalResults, focussedResult, enterCallback, initalFocussedResult, resetFocusCallback],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return focussedResult;
};

export default useArrowNavigation;
