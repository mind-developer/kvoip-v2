/* @kvoip-woulz proprietary */
import { useEffect, useState } from 'react';

import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';

export const useCallStates = (callState: CallState) => {
  const [isRinging, setIsRinging] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isActiveCall, setIsActiveCall] = useState(false);

  useEffect(() => {
    setIsRinging(callState.callStatus === CallStatus.CALLING);
  }, [callState.callStatus]);

  useEffect(() => {
    setIsIncomingCall(callState.incomingCall);
  }, [callState.incomingCall]);

  useEffect(() => {
    setIsActiveCall(callState.isInCall && !callState.incomingCall);
  }, [callState.isInCall, callState.incomingCall]);

  return { isRinging, isIncomingCall, isActiveCall };
};
