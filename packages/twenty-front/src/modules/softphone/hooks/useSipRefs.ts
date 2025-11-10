/* @kvoip-woulz proprietary */
import { useRef } from 'react';

import {
    Invitation,
    Registerer,
    Session,
    UserAgent,
} from 'sip.js';

export const useSipRefs = () => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userAgentRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const invitationRef = useRef<Invitation | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const registerIntervalRef = useRef<number>();

  return {
    timerRef,
    ringingTimerRef,
    userAgentRef,
    registererRef,
    sessionRef,
    invitationRef,
    remoteAudioRef,
    registerIntervalRef,
  };
};
