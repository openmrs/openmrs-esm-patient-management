import { useEffect, useState, useCallback } from 'react';

const useArrowNavigation = (
  inputRef: React.MutableRefObject<HTMLInputElement>,
  totalResults: number,
  enterCallback: (evt: any, index: number) => void,
  resetFocusCallback: () => void,
  initalFocussedResult: number = -1,
) => {
  const [focussedResult, setFocussedResult] = useState(initalFocussedResult);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'ArrowUp') {
        setFocussedResult((prev) => Math.max(-1, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setFocussedResult((prev) => Math.min(totalResults - 1, prev + 1));
      } else if (e.key === 'Enter' && focussedResult > -1) {
        enterCallback(e, focussedResult);
      } else if (document.activeElement !== inputRef.current) {
        resetFocusCallback();
        setFocussedResult(initalFocussedResult);
      }
    },
    [
      setFocussedResult,
      totalResults,
      focussedResult,
      enterCallback,
      initalFocussedResult,
      inputRef,
      resetFocusCallback,
    ],
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
