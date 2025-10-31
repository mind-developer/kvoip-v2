/* @kvoip-woulz proprietary */
import { useState } from 'react';
import { CallState } from '../types/callState';
import formatTime from '../utils/formatTime';

export const useCallTimer = (callState: CallState) => {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [ringingTime, setRingingTime] = useState<string>('00:00');

  const startTimer = (
    startTime: number | null,
    setTime: React.Dispatch<React.SetStateAction<string>>,
    timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  ) => {
    if (startTime) {
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        setTime(formatTime(elapsed));
      };
      updateTimer();
      timerRef.current = window.setInterval(
        updateTimer,
        1000,
      ) as unknown as ReturnType<typeof setInterval>;

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setTime('00:00');
    }
  };

  return {
    elapsedTime,
    ringingTime,
    startTimer
  };
};
